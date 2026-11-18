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
  UseInterceptors,
  UploadedFile,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import {
  FILE_STORAGE,
  FileStorage,
} from '@/common/storage/domain/interface/file-storage.interface';

@Controller('admin/achievements')
@UseGuards(JwtAuthGuard)
export class AdminAchievementsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly userAchievementRepository: UserAchievementRepository,
    @Inject(FILE_STORAGE) private readonly fileStorage: FileStorage,
  ) {}

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('keyword') keyword?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('criteria') criteria?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.queryBus.execute(
      new GetAchievementsQuery(
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 10,
        keyword,
        sortBy,
        sortOrder,
        criteria,
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      ),
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetAchievementByIdQuery(id));
  }

  @Post()
  @UseInterceptors(FileInterceptor('icon'))
  async create(
    @Body() dto: CreateAchievementDto,
    @UploadedFile() icon?: Express.Multer.File,
  ) {
    let iconUrl: string | null = dto.icon ?? null;

    if (icon) {
      const ext = icon.originalname.split('.').pop() ?? 'png';
      const key = `achievements/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      await this.fileStorage.upload({
        key,
        body: icon.buffer,
        contentType: icon.mimetype,
      });
      iconUrl = key;
    }

    return this.commandBus.execute(
      new CreateAchievementCommand(
        dto.name,
        dto.description,
        iconUrl,
        dto.criteria,
        dto.threshold,
        dto.reward,
      ),
    );
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('icon'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAchievementDto,
    @UploadedFile() icon?: Express.Multer.File,
  ) {
    let iconUrl: string | null = dto.icon ?? null;

    if (icon) {
      const ext = icon.originalname.split('.').pop() ?? 'png';
      const key = `achievements/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      await this.fileStorage.upload({
        key,
        body: icon.buffer,
        contentType: icon.mimetype,
      });
      iconUrl = key;
    }

    return this.commandBus.execute(
      new UpdateAchievementCommand(
        id,
        dto.name ?? '',
        dto.description ?? '',
        iconUrl,
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
