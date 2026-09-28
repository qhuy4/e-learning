import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { InstructorCertificateEntity } from '@/modules/teacher/infrastructure/entity/instructor-certificate.entity';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { CertificateStatus } from '@/modules/teacher/domain/enum/certificate-status.enum';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('admin/instructor-certificates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminInstructorCertificatesController {
  constructor(
    @InjectRepository(InstructorCertificateEntity)
    private readonly certRepo: Repository<InstructorCertificateEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
  ) {}

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 10;

    const qb = this.certRepo
      .createQueryBuilder('ic');

    const whereConditions: string[] = [];

    if (status) {
      const statusNum = parseInt(status, 10);
      if (!isNaN(statusNum) && statusNum in Object.values(CertificateStatus)) {
        whereConditions.push('ic.certificate_status = :status');
        qb.setParameter('status', statusNum);
      }
    }

    if (keyword) {
      whereConditions.push(
        '(ic.certificate_name ILIKE :keyword OR ic.issuer ILIKE :keyword OR CAST(ic.user_id AS TEXT) ILIKE :keyword)',
      );
      qb.setParameter('keyword', `%${keyword}%`);
    }

    if (whereConditions.length > 0) {
      qb.where(whereConditions.join(' AND '));
    }

    const sortableColumns: Record<string, string> = {
      createdAt: 'ic.created_at',
      certificateName: 'ic.certificate_name',
    };

    const sortKey = sortableColumns[sortBy ?? ''] ?? 'ic.created_at';
    const sortDir: 'ASC' | 'DESC' = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(sortKey, sortDir)
      .skip((p - 1) * l)
      .take(l);

    const [entities, total] = await qb.getManyAndCount();

    // Fetch user names in batch
    const userIds = [...new Set(entities.map((e) => e.userId))];
    const users = userIds.length > 0
      ? await this.userRepo.find({ where: { id: In(userIds) } })
      : [];
    const userMap = new Map<number, UserOrmEntity>(users.map((u) => [Number(u.id), u]));

    const data = entities.map((e) => ({
      id: Number(e.id),
      userId: Number(e.userId),
      certificateName: e.certificateName,
      issuer: e.issuer,
      filePath: e.filePath,
      issuedAt: e.issuedAt,
      expiresAt: e.expiresAt,
      certificateStatus: e.certificateStatus,
      rejectReason: e.rejectReason,
      reviewedAt: e.reviewedAt,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      user: (() => {
        const u: UserOrmEntity | undefined = userMap.get(Number(e.userId));
        return u ? { id: Number(u.id), name: u.name } : undefined;
      })(),
    }));

    return {
      data,
      meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const entity = await this.certRepo.findOne({ where: { id } });
    if (!entity) {
      throw new AppException(ErrorCode.INSTRUCTOR_CERTIFICATE_NOT_FOUND, 404);
    }

    const user = await this.userRepo.findOne({ where: { id: entity.userId } });
    let reviewer: UserOrmEntity | null = null;
    if (entity.reviewedBy) {
      reviewer = await this.userRepo.findOne({ where: { id: entity.reviewedBy } });
    }

    return {
      id: Number(entity.id),
      userId: Number(entity.userId),
      certificateName: entity.certificateName,
      issuer: entity.issuer,
      filePath: entity.filePath,
      issuedAt: entity.issuedAt,
      expiresAt: entity.expiresAt,
      certificateStatus: entity.certificateStatus,
      rejectReason: entity.rejectReason,
      reviewedAt: entity.reviewedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      user: user ? { id: Number(user.id), name: user.name, email: user.email } : undefined,
      reviewer: reviewer ? { id: Number(reviewer.id), name: reviewer.name } : undefined,
    };
  }

  @Patch(':id/approve')
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') adminId: number,
  ) {
    const entity = await this.certRepo.findOne({ where: { id } });
    if (!entity) {
      throw new AppException(ErrorCode.INSTRUCTOR_CERTIFICATE_NOT_FOUND, 404);
    }

    entity.certificateStatus = CertificateStatus.APPROVED;
    entity.reviewedBy = adminId;
    entity.reviewedAt = new Date();
    entity.rejectReason = null;

    await this.certRepo.save(entity);
    return { id: Number(entity.id), certificateStatus: entity.certificateStatus };
  }

  @Patch(':id/reject')
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body('rejectReason') rejectReason: string,
    @CurrentUser('id') adminId: number,
  ) {
    const entity = await this.certRepo.findOne({ where: { id } });
    if (!entity) {
      throw new AppException(ErrorCode.INSTRUCTOR_CERTIFICATE_NOT_FOUND, 404);
    }

    entity.certificateStatus = CertificateStatus.REJECTED;
    entity.reviewedBy = adminId;
    entity.reviewedAt = new Date();
    entity.rejectReason = rejectReason || null;

    await this.certRepo.save(entity);
    return { id: Number(entity.id), certificateStatus: entity.certificateStatus };
  }
}
