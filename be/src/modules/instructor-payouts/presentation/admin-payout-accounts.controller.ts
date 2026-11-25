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
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { GetInstructorPayoutAccountsQuery } from '@/modules/instructor-payouts/application/query/get-instructor-payout-accounts.query';
import { CreatePayoutAccountCommand } from '@/modules/instructor-payouts/application/command/create-payout-account.command';
import { UpdatePayoutAccountCommand } from '@/modules/instructor-payouts/application/command/update-payout-account.command';
import { DeletePayoutAccountCommand } from '@/modules/instructor-payouts/application/command/delete-payout-account.command';
import { CreatePayoutAccountDto } from '@/modules/instructor-payouts/presentation/dto/create-payout-account.dto';
import { UpdatePayoutAccountDto } from '@/modules/instructor-payouts/presentation/dto/update-payout-account.dto';
import { AdminPayoutAccountResponseMapper } from '@/modules/instructor-payouts/presentation/mapper/admin-payout-account-response.mapper';
import { PayoutAccount } from '@/modules/instructor-payouts/domain/entity/payout-account.entity';

@Controller('admin/payout-accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminPayoutAccountsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async findAll(@Query('instructorProfileId') instructorProfileId: string) {
    const result = await this.queryBus.execute<
      GetInstructorPayoutAccountsQuery,
      PayoutAccount[]
    >(
      new GetInstructorPayoutAccountsQuery({
        instructorProfileId: parseInt(instructorProfileId, 10),
      }),
    );
    return result.map((account) =>
      AdminPayoutAccountResponseMapper.toResponse(account),
    );
  }

  @Post()
  async create(@Body() dto: CreatePayoutAccountDto) {
    const account = await this.commandBus.execute<
      CreatePayoutAccountCommand,
      PayoutAccount
    >(
      new CreatePayoutAccountCommand({
        instructorProfileId: dto.instructorProfileId,
        accountType: dto.accountType,
        accountHolderName: dto.accountHolderName,
        accountNumber: dto.accountNumber,
        bankName: dto.bankName,
        bankBranch: dto.bankBranch,
        routingCode: dto.routingCode,
        paypalEmail: dto.paypalEmail,
        currency: dto.currency,
        isPrimary: dto.isPrimary,
      }),
    );
    return AdminPayoutAccountResponseMapper.toResponse(account);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePayoutAccountDto) {
    const account = await this.commandBus.execute<
      UpdatePayoutAccountCommand,
      PayoutAccount
    >(
      new UpdatePayoutAccountCommand({
        id,
        accountType: dto.accountType,
        accountHolderName: dto.accountHolderName,
        accountNumber: dto.accountNumber,
        bankName: dto.bankName,
        bankBranch: dto.bankBranch,
        routingCode: dto.routingCode,
        paypalEmail: dto.paypalEmail,
        currency: dto.currency,
        isPrimary: dto.isPrimary,
        isActive: dto.isActive,
      }),
    );
    return AdminPayoutAccountResponseMapper.toResponse(account);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.commandBus.execute(new DeletePayoutAccountCommand({ id }));
  }
}
