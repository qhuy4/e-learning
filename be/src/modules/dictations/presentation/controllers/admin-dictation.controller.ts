import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { GetAllDictationsQuery } from '../../application/query/get-all-dictations.query';
import { DeleteDictationCommand } from '../../application/command/delete-dictation.command';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Dictation } from '../../domain/entity/dictation.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/dictations')
export class AdminDictationController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Get()
  async getAll() {
    return this.queryBus.execute<GetAllDictationsQuery, Dictation[]>(
      new GetAllDictationsQuery(),
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser('id') adminId: number) {
    // Note: DeleteDictationCommand validates ownership (createdBy). An Admin specific command might bypass that, but this is a stub.
    return this.commandBus.execute<DeleteDictationCommand, { success: true }>(
      new DeleteDictationCommand(id, adminId.toString()),
    );
  }
}
