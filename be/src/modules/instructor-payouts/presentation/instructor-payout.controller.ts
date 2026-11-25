import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
  ForbiddenException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { InstructorProfileTypeOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-profile.orm.entity';
import {
  IPayoutAccountRepository,
  PAYOUT_ACCOUNT_REPOSITORY,
} from '@/modules/instructor-payouts/domain/repository/payout-account.repository';
import { PayoutAccountOrmEntity } from '@/modules/instructor-payouts/infrastructure/entity/payout-account.orm-entity';
import {
  IInstructorPayoutRepository,
  INSTRUCTOR_PAYOUT_REPOSITORY,
} from '@/modules/instructor-payouts/domain/repository/instructor-payout.repository';
import {
  IRevenueSplitRepository,
  REVENUE_SPLIT_REPOSITORY,
} from '@/modules/instructor-payouts/domain/repository/revenue-split.repository';
import { CreateInstructorPayoutAccountDto } from '@/modules/instructor-payouts/presentation/dto/create-instructor-payout-account.dto';
import { UpdatePayoutAccountDto } from '@/modules/instructor-payouts/presentation/dto/update-payout-account.dto';
import { PayoutStatus } from '@/modules/instructor-payouts/domain/enum/payout-status.enum';
import { PaymentMethod } from '@/modules/instructor-payouts/domain/enum/payment-method.enum';
import { CasService } from '@/modules/instructor-payouts/infrastructure/cas/cas.service';
import { CasConfig } from '@/modules/instructor-payouts/infrastructure/cas/cas.config';
import { namesMatch } from '@/modules/instructor-payouts/infrastructure/cas/utils/name.util';

@Controller('instructor/payouts')
@UseGuards(JwtAuthGuard)
export class InstructorPayoutController {
  constructor(
    @InjectRepository(InstructorProfileTypeOrmEntity)
    private readonly instructorProfileRepo: Repository<InstructorProfileTypeOrmEntity>,
    @Inject(PAYOUT_ACCOUNT_REPOSITORY)
    private readonly payoutAccountRepo: IPayoutAccountRepository,
    @Inject(INSTRUCTOR_PAYOUT_REPOSITORY)
    private readonly payoutRepo: IInstructorPayoutRepository,
    @Inject(REVENUE_SPLIT_REPOSITORY)
    private readonly revenueSplitRepo: IRevenueSplitRepository,
    private readonly casService: CasService,
    private readonly casConfig: CasConfig,
  ) {}

  private async resolveInstructorProfileId(userId: number): Promise<number> {
    const profile = await this.instructorProfileRepo.findOne({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw new AppException(ErrorCode.INSTRUCTOR_PROFILE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return profile.id;
  }

  private async validateAccountOwnership(accountId: number, instructorProfileId: number) {
    const account = await this.payoutAccountRepo.findById(accountId);
    if (!account) {
      throw new AppException(ErrorCode.PAYOUT_ACCOUNT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (account.instructorProfileId !== instructorProfileId) {
      throw new ForbiddenException('You do not have access to this payout account');
    }
    return account;
  }

  private async validatePayoutOwnership(payoutId: number, instructorProfileId: number) {
    const payout = await this.payoutRepo.findById(payoutId);
    if (!payout) {
      throw new AppException(ErrorCode.PAYOUT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (payout.instructorId !== instructorProfileId) {
      throw new ForbiddenException('You do not have access to this payout');
    }
    return payout;
  }

  @Get('accounts')
  async listAccounts(@CurrentUser('id') userId: number) {
    const instructorProfileId = await this.resolveInstructorProfileId(userId);
    return this.payoutAccountRepo.findByInstructorProfileId(instructorProfileId);
  }

  @Post('accounts')
  async createAccount(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateInstructorPayoutAccountDto,
  ) {
    const instructorProfileId = await this.resolveInstructorProfileId(userId);
    return this.payoutAccountRepo.create({
      instructorProfileId: instructorProfileId.toString(),
      accountType: dto.accountType,
      accountHolderName: dto.accountHolderName,
      accountNumber: dto.accountNumber ?? null,
      bankName: dto.bankName ?? null,
      bankBranch: dto.bankBranch ?? null,
      routingCode: dto.routingCode ?? null,
      paypalEmail: dto.paypalEmail ?? null,
      currency: dto.currency ?? 'VND',
      isPrimary: dto.isPrimary ?? false,
      isVerified: false,
      isActive: true,
    });
  }

  @Patch('accounts/:id')
  async updateAccount(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePayoutAccountDto,
  ) {
    const instructorProfileId = await this.resolveInstructorProfileId(userId);
    await this.validateAccountOwnership(id, instructorProfileId);

    const updateData: Partial<PayoutAccountOrmEntity> = {};
    if (dto.accountType !== undefined) updateData.accountType = dto.accountType;
    if (dto.accountHolderName !== undefined) updateData.accountHolderName = dto.accountHolderName;
    if (dto.accountNumber !== undefined) updateData.accountNumber = dto.accountNumber;
    if (dto.bankName !== undefined) updateData.bankName = dto.bankName;
    if (dto.bankBranch !== undefined) updateData.bankBranch = dto.bankBranch;
    if (dto.routingCode !== undefined) updateData.routingCode = dto.routingCode;
    if (dto.paypalEmail !== undefined) updateData.paypalEmail = dto.paypalEmail;
    if (dto.currency !== undefined) updateData.currency = dto.currency;
    if (dto.isPrimary !== undefined) updateData.isPrimary = dto.isPrimary;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const bankIdentityChanged =
      dto.accountNumber !== undefined ||
      dto.bankName !== undefined ||
      dto.accountHolderName !== undefined;

    if (bankIdentityChanged) {
      updateData.isVerified = false;
      updateData.verifiedAt = null;
      updateData.casGrantId = null;
    }

    return this.payoutAccountRepo.update(id, updateData);
  }

  @Delete('accounts/:id')
  async deleteAccount(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const instructorProfileId = await this.resolveInstructorProfileId(userId);
    await this.validateAccountOwnership(id, instructorProfileId);
    await this.payoutAccountRepo.delete(id);
    return null;
  }

  @Post('accounts/:id/link')
  async createLinkToken(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const instructorProfileId = await this.resolveInstructorProfileId(userId);
    const account = await this.validateAccountOwnership(id, instructorProfileId);

    if (account.accountType !== 'bank') {
      throw new BadRequestException('Only bank accounts can be verified via Cas');
    }

    const redirectUri = this.casConfig.redirectUri;
    const state = `accountId=${id}`;
    const { grantToken } = await this.casService.createGrantToken(redirectUri);
    const casLinkUrl = this.casService.buildCasLinkUrl(grantToken, redirectUri, state);

    await this.payoutAccountRepo.update(id, { casGrantId: grantToken });

    return { grantToken, casLinkUrl };
  }

  @Post('accounts/:id/verify')
  async verifyAccount(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { publicToken: string },
  ) {
    if (!body.publicToken) {
      throw new BadRequestException('publicToken is required');
    }

    const instructorProfileId = await this.resolveInstructorProfileId(userId);
    const account = await this.validateAccountOwnership(id, instructorProfileId);

    if (account.isVerified) {
      return { verified: true, message: 'Account is already verified' };
    }

    const { accessToken } = await this.casService.exchangePublicToken(body.publicToken);

    const identity = await this.casService.getIdentity(accessToken);

    if (!identity.accountHolderName) {
      throw new BadRequestException('Could not retrieve account holder name from Cas');
    }

    const matched = namesMatch(account.accountHolderName, identity.accountHolderName);

    if (matched) {
      await this.payoutAccountRepo.update(id, {
        isVerified: true,
        verifiedAt: new Date(),
        casGrantId: null,
      });
      return { verified: true, message: 'Account verified successfully' };
    } else {
      return {
        verified: false,
        message: `Verification failed: name mismatch. Expected "${account.accountHolderName}", got "${identity.accountHolderName}"`,
      };
    }
  }

  @Get()
  async listPayouts(
    @CurrentUser('id') userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const instructorProfileId = await this.resolveInstructorProfileId(userId);
    const result = await this.payoutRepo.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      instructorId: instructorProfileId,
      status: status !== undefined ? parseInt(status, 10) : undefined,
    });
    return { data: result.data, meta: result.meta };
  }

  @Get(':id')
  async getPayout(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const instructorProfileId = await this.resolveInstructorProfileId(userId);
    return this.validatePayoutOwnership(id, instructorProfileId);
  }

  @Post('request')
  async requestWithdrawal(
    @CurrentUser('id') userId: number,
    @Body() body: { payoutAccountId: number; periodStart?: string; periodEnd?: string },
  ) {
    const instructorProfileId = await this.resolveInstructorProfileId(userId);
    await this.validateAccountOwnership(body.payoutAccountId, instructorProfileId);

    const { data: splits } = await this.revenueSplitRepo.findAll({
      page: 1,
      limit: 10000,
      instructorId: userId,
      payoutStatus: 'pending',
    });

    let periodSplits = splits;
    // createdAt là Date (mapper) — giữ nguyên runtime gọi split như ban đầu.
    const periodStart =
      body.periodStart ||
      (splits[0]?.createdAt as unknown as string | undefined)?.split('T')[0] ||
      new Date().toISOString().split('T')[0];
    const periodEnd =
      body.periodEnd ||
      (
        splits[splits.length - 1]?.createdAt as unknown as string | undefined
      )?.split('T')[0] ||
      new Date().toISOString().split('T')[0];

    if (body.periodStart && body.periodEnd) {
      const start = new Date(body.periodStart);
      const end = new Date(body.periodEnd);
      end.setHours(23, 59, 59, 999);
      periodSplits = splits.filter((split) => {
        const created = new Date(split.createdAt!);
        return created >= start && created <= end;
      });
    }

    if (periodSplits.length === 0) {
      throw new AppException(ErrorCode.PAYOUT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const totalGross = periodSplits.reduce(
      (sum, s) => sum + Number(s.grossAmount),
      0,
    );
    const totalPlatformFee = periodSplits.reduce(
      (sum, s) => sum + Number(s.platformFeeAmount),
      0,
    );
    const totalInstructorAmount = periodSplits.reduce(
      (sum, s) => sum + Number(s.instructorAmount),
      0,
    );

    return this.payoutRepo.create({
      instructorId: instructorProfileId,
      payoutAccountId: body.payoutAccountId,
      periodStart,
      periodEnd,
      totalGross,
      totalPlatformFee,
      totalInstructorAmount,
      currency: 'VND',
      status: PayoutStatus.PENDING,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
    });
  }
}
