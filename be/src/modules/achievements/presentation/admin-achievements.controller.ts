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
import { GetAchievementsQuery } from '@/modules/achievements/application/query/get-achievements.query';
import { GetAchievementByIdQuery } from '@/modules/achievements/application/query/get-achievement-by-id.query';
import { CreateAchievementCommand } from '@/modules/achievements/application/command/create-achievement.command';
import { UpdateAchievementCommand } from '@/modules/achievements/application/command/update-achievement.command';
import { DeleteAchievementCommand } from '@/modules/achievements/application/command/delete-achievement.command';
import { CreateAchievementDto } from '@/modules/achievements/presentation/dto/create-achievement.dto';
import { UpdateAchievementDto } from '@/modules/achievements/presentation/dto/update-achievement.dto';
import { UserAchievementRepository } from '@/modules/achievements/infrastructure/repository/user-achievement.repository';

@Controller('admin/achievements')
@UseGuards(JwtAuthGuard)
export class AdminAchievementsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly userAchievementRepository: UserAchievementRepository,
  ) {}

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('keyword') keyword?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.queryBus.execute(
      new GetAchievementsQuery(
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 10,
        keyword,
        sortBy,
        sortOrder,
      ),
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetAchievementByIdQuery(id));
  }

  @Post()
  async create(@Body() dto: CreateAchievementDto) {
    return this.commandBus.execute(
      new CreateAchievementCommand(
        dto.name,
        dto.description,
        dto.icon ?? null,
        dto.criteria,
        dto.threshold,
        dto.reward,
      ),
    );
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAchievementDto) {
    return this.commandBus.execute(
      new UpdateAchievementCommand(
        id,
        dto.name ?? '',
        dto.description ?? '',
        dto.icon ?? null,
        dto.criteria ?? '',
        dto.threshold ?? 1,
        dto.reward ?? null,
        dto.isActive ?? true,
      ),
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.commandBus.execute(new DeleteAchievementCommand(id));
  }

  @Get(':id/users')
  async getUsers(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.userAchievementRepository.findByAchievementPaginated(id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      keyword,
    });
  }
}
