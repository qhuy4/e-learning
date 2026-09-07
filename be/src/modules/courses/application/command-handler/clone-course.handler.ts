import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

import { CloneCourseCommand } from '@/modules/courses/application/command/clone-course.command';
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';
import { SectionOrmEntity } from '@/modules/sections/infrastructure/entity/section.orm-entity';
import { LessonOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson.orm-entity';

@CommandHandler(CloneCourseCommand)
export class CloneCourseHandler implements ICommandHandler<CloneCourseCommand> {
  constructor(
    @InjectRepository(CourseOrmEntity)
    private readonly courseRepo: Repository<CourseOrmEntity>,
    @InjectRepository(SectionOrmEntity)
    private readonly sectionRepo: Repository<SectionOrmEntity>,
    @InjectRepository(LessonOrmEntity)
    private readonly lessonRepo: Repository<LessonOrmEntity>,
  ) {}

  async execute(command: CloneCourseCommand) {
    const { courseId, instructorId } = command;

    const original = await this.courseRepo.findOne({
      where: { id: courseId.toString() },
      relations: { sections: { lessons: true } },
    });

    if (!original) {
      throw new NotFoundException('Course not found');
    }

    if (original.instructorId !== instructorId.toString()) {
      throw new ForbiddenException('You do not own this course');
    }

    let newSlug = slugify(`${original.title}-copy`, {
      lower: true,
      strict: true,
      trim: true,
    });

    let counter = 1;
    while (await this.courseRepo.findOne({ where: { slug: newSlug } })) {
      newSlug = slugify(`${original.title}-copy-${counter}`, {
        lower: true,
        strict: true,
        trim: true,
      });
      counter++;
    }

    const cloned = this.courseRepo.create({
      instructorId: original.instructorId,
      title: `${original.title} (Bản sao)`,
      slug: newSlug,
      description: original.description,
      thumbnail: original.thumbnail,
      level: original.level,
      price: original.price,
      status: 1,
      version: 1,
    });
    const savedCourse = await this.courseRepo.save(cloned);

    const sections = (original.sections ?? [])
      .filter((s) => !s.deletedAt)
      .sort((a, b) => a.position - b.position);

    for (const origSection of sections) {
      const clonedSection = this.sectionRepo.create({
        courseId: savedCourse.id,
        title: origSection.title,
        slug: slugify(origSection.title, { lower: true, strict: true, trim: true }),
        description: origSection.description,
        position: origSection.position,
        isActive: origSection.isActive,
      });
      const savedSection = await this.sectionRepo.save(clonedSection);

      const lessons = (origSection.lessons ?? [])
        .filter((l) => !l.deletedAt)
        .sort((a, b) => a.position - b.position);

      for (const origLesson of lessons) {
        const clonedLesson = this.lessonRepo.create({
          sectionId: savedSection.id,
          title: origLesson.title,
          slug: slugify(origLesson.title, { lower: true, strict: true, trim: true }),
          type: origLesson.type,
          videoProvider: origLesson.videoProvider,
          videoSource: origLesson.videoSource,
          duration: origLesson.duration,
          content: origLesson.content,
          position: origLesson.position,
          status: 0,
          isPreview: origLesson.isPreview,
        });
        await this.lessonRepo.save(clonedLesson);
      }
    }

    return this.courseRepo.findOne({
      where: { id: savedCourse.id },
      relations: { sections: { lessons: true } },
    });
  }
}
