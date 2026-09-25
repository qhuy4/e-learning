import {
  Body,
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { avatarUploadConfig } from '@/config/multer.config';
import { GetMyProfileQuery } from '@/modules/users/application/query/get-my-profile.query';
import { UpdateUserDto } from '@/modules/users/presentation/dto/common/update-user.dto';
import { UpdateUserCommandMapper } from '@/modules/users/presentation/mapper/update-user.mapper';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('me')
  getMe(@CurrentUser('id') userId: number) {
    return this.queryBus.execute(new GetMyProfileQuery(userId));
  }

  @Patch('me')
  @UseInterceptors(FileInterceptor('avatar', avatarUploadConfig))
  async updateMe(
    @CurrentUser('id') userId: number,
    @Body() dto: UpdateUserDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    // Self-update: only name/email/profile — role, status, password are stripped.
    await this.commandBus.execute(
      UpdateUserCommandMapper.toCommand(
        userId,
        { name: dto.name, email: dto.email, profile: dto.profile },
        avatar,
      ),
    );
    return this.queryBus.execute(new GetMyProfileQuery(userId));
  }
}
