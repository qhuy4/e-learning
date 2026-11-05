import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { TeachingProfileService } from '@/modules/instructors/application/teaching-profile.service';
import { UpdateTeachingProfileDto } from '@/modules/instructors/presentation/dto/update-teaching-profile.dto';

@Controller('instructor/teaching-profile')
@UseGuards(JwtAuthGuard)
export class TeachingProfileController {
  constructor(
    private readonly teachingProfileService: TeachingProfileService,
  ) {}

  @Get()
  get(@CurrentUser('id') userId: number) {
    return this.teachingProfileService.get(userId);
  }

  @Put()
  update(
    @CurrentUser('id') userId: number,
    @Body() dto: UpdateTeachingProfileDto,
  ) {
    return this.teachingProfileService.update(userId, dto);
  }
}
