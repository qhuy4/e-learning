import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateInstructorCommand } from '@/modules/instructors/application/command/update-instructor.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { InstructorProfileTypeOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-profile.orm.entity';
import { NotFoundException } from '@nestjs/common';
import { UserStatus } from '@/modules/users/domain/enum/user.status';

const statusMap: Record<string, UserStatus> = {
  ACTIVE: UserStatus.ACTIVE,
  BLOCKED: UserStatus.BLOCKED,
  PENDING: UserStatus.PENDING,
};

@CommandHandler(UpdateInstructorCommand)
export class UpdateInstructorHandler implements ICommandHandler<UpdateInstructorCommand> {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    @InjectRepository(InstructorProfileTypeOrmEntity)
    private readonly profileRepository: Repository<InstructorProfileTypeOrmEntity>,
  ) {}

  async execute(command: UpdateInstructorCommand): Promise<any> {
    const { id, name, email, status, headline, bio, websiteUrl, socialLinks } = command.data;

    // Find the instructor profile
    const profile = await this.profileRepository.findOne({
      where: { userId: id },
      relations: { user: true },
    });

    if (!profile) {
      throw new NotFoundException(`Instructor with user ID ${id} not found`);
    }

    // Update user fields
    if (name !== undefined || email !== undefined || status !== undefined) {
      const userUpdate: Partial<UserOrmEntity> = {};
      if (name !== undefined) userUpdate.name = name;
      if (email !== undefined) userUpdate.email = email;
      if (status !== undefined) userUpdate.status = statusMap[status] ?? UserStatus.ACTIVE;

      await this.userRepository.update(id, userUpdate);
    }

    // Update profile fields
    if (headline !== undefined || bio !== undefined || websiteUrl !== undefined || socialLinks !== undefined) {
      const profileUpdate: Partial<InstructorProfileTypeOrmEntity> = {};
      if (headline !== undefined) profileUpdate.headline = headline;
      if (bio !== undefined) profileUpdate.bio = bio;
      if (websiteUrl !== undefined) profileUpdate.websiteUrl = websiteUrl;
      if (socialLinks !== undefined) profileUpdate.socialLinks = socialLinks;

      await this.profileRepository.update(profile.id, profileUpdate);
    }

    // Return updated instructor
    const updatedProfile = await this.profileRepository.findOne({
      where: { userId: id },
      relations: { user: true },
    });

    if (!updatedProfile) {
      throw new NotFoundException(`Instructor with user ID ${id} not found after update`);
    }

    return {
      id: updatedProfile.user.id,
      userId: updatedProfile.userId,
      name: updatedProfile.user.name,
      email: updatedProfile.user.email,
      status: updatedProfile.user.status,
      headline: updatedProfile.headline,
      bio: updatedProfile.bio,
      websiteUrl: updatedProfile.websiteUrl,
      socialLinks: updatedProfile.socialLinks,
    };
  }
}
