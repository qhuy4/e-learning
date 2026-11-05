import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { UserRole } from '@/modules/users/domain/enum/user.role';
import { UserStatus } from '@/modules/users/domain/enum/user.status';
import { ApprovalStatus } from '@/modules/instructors/domain/enum/instructor-profile.status';
import { InstructorProfileTypeOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-profile.orm.entity';
import { InstructorCertificateEntity } from '@/modules/instructors/infrastructure/entity/instructor-certificate.entity';
import { CertificateStatus } from '@/modules/instructors/domain/enum/certificate-status.enum';
import { ListPublicInstructorsDto } from '@/modules/instructors/presentation/dto/list-public-instructors.dto';

@Controller('instructors')
export class PublicInstructorsController {
  constructor(
    @InjectRepository(InstructorProfileTypeOrmEntity)
    private readonly profileRepository: Repository<InstructorProfileTypeOrmEntity>,
    @InjectRepository(InstructorCertificateEntity)
    private readonly certificateRepository: Repository<InstructorCertificateEntity>,
  ) {}

  @Get()
  async list(@Query() query: ListPublicInstructorsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const qb = this.profileRepository
      .createQueryBuilder('instructor')
      .innerJoinAndSelect('instructor.user', 'user')
      .where('user.role = :role', { role: UserRole.INSTRUCTOR })
      .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
      .andWhere('user.deleted_at IS NULL')
      .andWhere('instructor.approval_status = :approvalStatus', {
        approvalStatus: ApprovalStatus.APPROVED,
      });

    if (query.keyword?.trim()) {
      qb.andWhere(
        '(user.name ILIKE :keyword OR instructor.headline ILIKE :keyword OR instructor.bio ILIKE :keyword)',
        { keyword: `%${query.keyword.trim()}%` },
      );
    }

    if (query.tag) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM instructor_certificates c
          WHERE c.user_id = instructor.user_id
            AND c.deleted_at IS NULL
            AND c.certificate_status = :certificateStatus
            AND c.tags IS NOT NULL
            AND jsonb_exists(c.tags, :tag)
        )`,
        {
          certificateStatus: CertificateStatus.APPROVED,
          tag: query.tag,
        },
      );
    }

    qb.orderBy('instructor.approved_at', 'DESC', 'NULLS LAST')
      .addOrderBy('instructor.avg_rating', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [profiles, total] = await qb.getManyAndCount();
    const tagsByUser = await this.getTagsByUserIds(
      profiles.map((profile) => profile.userId),
    );
    const data = profiles.map((profile) =>
      this.toInstructorView(profile, tagsByUser.get(profile.userId) ?? []),
    );

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const profile = await this.profileRepository
      .createQueryBuilder('instructor')
      .innerJoinAndSelect('instructor.user', 'user')
      .where('user.id = :id', { id })
      .andWhere('user.role = :role', { role: UserRole.INSTRUCTOR })
      .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
      .andWhere('user.deleted_at IS NULL')
      .andWhere('instructor.approval_status = :approvalStatus', {
        approvalStatus: ApprovalStatus.APPROVED,
      })
      .getOne();

    if (!profile) {
      throw new AppException(
        ErrorCode.INSTRUCTOR_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const tagsByUser = await this.getTagsByUserIds([profile.userId]);
    return this.toInstructorView(
      profile,
      tagsByUser.get(profile.userId) ?? [],
    );
  }

  private async getTagsByUserIds(
    userIds: number[],
  ): Promise<Map<number, string[]>> {
    const result = new Map<number, string[]>();

    if (userIds.length === 0) {
      return result;
    }

    const certificates = await this.certificateRepository.find({
      where: {
        userId: In(userIds),
        certificateStatus: CertificateStatus.APPROVED,
      },
    });

    for (const certificate of certificates) {
      const current = result.get(certificate.userId) ?? [];
      for (const tag of certificate.tags ?? []) {
        if (!current.includes(tag)) {
          current.push(tag);
        }
      }
      result.set(certificate.userId, current);
    }

    return result;
  }

  private toInstructorView(
    profile: InstructorProfileTypeOrmEntity,
    certificateTags: string[],
  ) {
    return {
      id: profile.user.id,
      name: profile.user.name,
      email: profile.user.email,
      avatarUrl: null,
      profile: {
        id: profile.id,
        headline: profile.headline,
        bio: profile.bio,
        websiteUrl: profile.websiteUrl,
        socialLinks: profile.socialLinks,
        avgRating: Number(profile.avgRating ?? 0),
        totalStudents: profile.totalStudents,
        approvalStatus: 'APPROVED',
        approvedAt: profile.approvedAt,
        certificateTags,
      },
    };
  }
}
