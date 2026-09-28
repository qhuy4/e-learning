import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstructorProfileEntity } from '@/modules/teacher/infrastructure/entity/instructor-profile.entity';
import { InstructorCertificateEntity } from '@/modules/teacher/infrastructure/entity/instructor-certificate.entity';
import { ApprovalStatus } from '@/modules/teacher/domain/enum/approval-status.enum';
import { ReviewTeacherProfileDto } from '@/modules/teacher/presentation/dto/review-teacher-profile.dto';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { HttpStatus } from '@nestjs/common';

@Controller('admin/teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminTeacherController {
  constructor(
    @InjectRepository(InstructorProfileEntity)
    private readonly profileRepo: Repository<InstructorProfileEntity>,
    @InjectRepository(InstructorCertificateEntity)
    private readonly certRepo: Repository<InstructorCertificateEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
  ) {}

  /**
   * GET /admin/teachers/pending-profiles
   * Lấy danh sách hồ sơ giảng viên chờ duyệt cùng bằng cấp và thông tin user.
   */
  @Get('pending-profiles')
  async getPendingProfiles(@Query('status') status?: string) {
    const targetStatus = status === 'all' ? undefined : status
      ? Number(status)
      : ApprovalStatus.PENDING;
    if (targetStatus !== undefined &&
      ![ApprovalStatus.PENDING, ApprovalStatus.APPROVED, ApprovalStatus.REJECTED].includes(targetStatus)) {
      throw new BadRequestException('Trạng thái hồ sơ không hợp lệ.');
    }

    const profiles = await this.profileRepo.find({
      where: targetStatus === undefined ? {} : { approvalStatus: targetStatus },
      order: { createdAt: 'DESC' },
    });

    const results = await Promise.all(
      profiles.map(async (profile) => {
        const [user, certificates] = await Promise.all([
          this.userRepo.findOne({
            where: { id: Number(profile.userId) },
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
              created_at: true,
            },
          }),
          this.certRepo.find({
            where: { userId: Number(profile.userId) },
          }),
        ]);

        return {
          profileId: profile.id,
          userId: profile.userId,
          user: user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                joinedAt: user.created_at,
              }
            : null,
          headline: profile.headline,
          bio: profile.bio,
          websiteUrl: profile.websiteUrl,
          socialLinks: profile.socialLinks,
          approvalStatus: profile.approvalStatus,
          reviewReason: profile.reviewReason,
          createdAt: profile.createdAt,
          certificates: certificates.map((c) => ({
            id: c.id,
            certificateName: c.certificateName,
            issuer: c.issuer,
            filePath: c.filePath,
            issuedAt: c.issuedAt,
            expiresAt: c.expiresAt,
            status: c.certificateStatus,
          })),
        };
      }),
    );

    return {
      success: true,
      total: results.length,
      data: results,
    };
  }

  /**
   * PATCH /admin/teachers/:profileId/review
   * Phê duyệt (APPROVED) hoặc Từ chối (REJECTED) hồ sơ giảng viên
   */
  @Patch(':profileId/review')
  async reviewProfile(
    @Param('profileId', ParseIntPipe) profileId: number,
    @Body() dto: ReviewTeacherProfileDto,
  ) {
    const profile = await this.profileRepo.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new AppException(ErrorCode.INSTRUCTOR_PROFILE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (profile.approvalStatus === ApprovalStatus.APPROVED) {
      throw new BadRequestException('Hồ sơ này đã được phê duyệt trước đó.');
    }

    if (![ApprovalStatus.APPROVED, ApprovalStatus.REJECTED].includes(dto.status)) {
      throw new BadRequestException('Trạng thái duyệt không hợp lệ.');
    }
    if (dto.status === ApprovalStatus.REJECTED && !dto.rejectReason?.trim()) {
      throw new BadRequestException('Vui lòng nhập lý do từ chối hồ sơ.');
    }
    profile.approvalStatus = dto.status;
    profile.reviewReason = dto.status === ApprovalStatus.REJECTED ? dto.rejectReason!.trim() : null;
    if (dto.status === ApprovalStatus.APPROVED) {
      profile.approvedAt = new Date();
    } else {
      profile.approvedAt = null;
    }

    await this.profileRepo.save(profile);

    return {
      success: true,
      message:
        dto.status === ApprovalStatus.APPROVED
          ? 'Đã phê duyệt hồ sơ giảng viên thành công!'
          : 'Đã từ chối hồ sơ giảng viên.',
      profileId: profile.id,
      approvalStatus: profile.approvalStatus,
      approvedAt: profile.approvedAt,
    };
  }
}
