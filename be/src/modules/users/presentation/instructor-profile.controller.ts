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
import { GetInstructorProfileQuery } from '@/modules/users/application/query/get-instructor-profile.query';
import { UpdateInstructorProfileCommand } from '@/modules/users/application/command/update-instructor-profile.command';

@Controller('instructor/profile')
@UseGuards(JwtAuthGuard)
export class InstructorProfileController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  getProfile(@CurrentUser('id') userId: number) {
    return this.queryBus.execute(new GetInstructorProfileQuery(userId));
  }

  @Patch()
  @UseInterceptors(FileInterceptor('avatar', avatarUploadConfig))
  async updateProfile(
    @CurrentUser('id') userId: number,
    @Body() body: any,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    let profileData: Record<string, any> = {};
    if (body.profile) {
      try {
        profileData =
          typeof body.profile === 'string'
            ? JSON.parse(body.profile)
            : body.profile;
      } catch {
        profileData = {};
      }
    }

    return this.commandBus.execute(
      new UpdateInstructorProfileCommand(userId, {
        name: body.name,
        profile: profileData,
        avatar,
      }),
    );
  }
}
