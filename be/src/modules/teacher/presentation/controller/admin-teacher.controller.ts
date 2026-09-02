import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstructorProfileEntity } from '../../infrastructure/entity/instructor-profile.entity';
import { InstructorKycEntity } from '../../infrastructure/entity/instructor-kyc.entity';
import { InstructorCertificateEntity } from '../../infrastructure/entity/instructor-certificate.entity';
// import { User } from '../../../users/domain/entity/user.entity';
import { ApprovalStatus } from '../../domain/enum/approval-status.enum';
import { ReviewTeacherProfileDto } from '../dto/review-teacher-profile.dto';
import { UserOrmEntity } from '../../../users/infrastructure/entity/user.orm.entity';

@Controller('admin/teachers')
export class AdminTeacherController {
  constructor(
    @InjectRepository(InstructorProfileEntity)
    private readonly profileRepo: Repository<InstructorProfileEntity>,
    @InjectRepository(InstructorKycEntity)
    private readonly kycRepo: Repository<InstructorKycEntity>,
    @InjectRepository(InstructorCertificateEntity)
    private readonly certRepo: Repository<InstructorCertificateEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
    // @InjectRepository(User)
    // private readonly userRepo: Repository<User>,
  ) {}

  /**
   * GET /admin/teachers/pending-profiles
   * Lấy danh sách hồ sơ giảng viên chờ duyệt (kèm chi tiết KYC + bằng cấp + thông tin user)
   */
  @Get('pending-profiles')
  async getPendingProfiles(@Query('status') status?: string) {
    const targetStatus = status
      ? Number(status)
      : ApprovalStatus.PENDING;

    const profiles = await this.profileRepo.find({
      where: { approvalStatus: targetStatus },
      order: { createdAt: 'DESC' },
    });

    const results = await Promise.all(
      profiles.map(async (profile) => {
        const [user, kyc, certificates] = await Promise.all([
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
          this.kycRepo.findOne({
            where: { userId: Number(profile.userId) },
            order: { createdAt: 'DESC' },
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
          createdAt: profile.createdAt,
          kyc: kyc
            ? {
                id: kyc.id,
                kycStatus: kyc.kycStatus,
                identityNumber: kyc.identityNumber,
                identityFront: kyc.identityFront,
                identityBack: kyc.identityBack,
                selfieWithId: kyc.selfieWithId,
                ocrVerified: kyc.ocrVerified,
                faceVerified: kyc.faceVerified,
                ocrData: kyc.ocrData,
                faceData: kyc.faceData,
                rejectReason: kyc.rejectReason,
              }
            : null,
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
      throw new NotFoundException('Không tìm thấy hồ sơ giảng viên này.');
    }

    if (profile.approvalStatus === ApprovalStatus.APPROVED) {
      throw new BadRequestException('Hồ sơ này đã được phê duyệt trước đó.');
    }

    profile.approvalStatus = dto.status;
    if (dto.status === ApprovalStatus.APPROVED) {
      profile.approvedAt = new Date();
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
