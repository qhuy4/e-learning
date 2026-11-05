import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { InstructorApplicationsService } from '@/modules/instructor-applications/application/services/instructor-applications.service';
import { ListInstructorApplicationsDto } from '@/modules/instructor-applications/presentation/dto/list-instructor-applications.dto';
import { InstructorApplicationReasonDto } from '@/modules/instructor-applications/presentation/dto/instructor-application-reason.dto';
import { ApproveInstructorApplicationDto } from '@/modules/instructor-applications/presentation/dto/approve-instructor-application.dto';
import { ReviewCertificateDto } from '@/modules/instructor-applications/presentation/dto/review-certificate.dto';

@Controller('admin/instructor-applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminInstructorApplicationsController {
  constructor(
    private readonly instructorApplicationsService: InstructorApplicationsService,
  ) {}

  @Get()
  list(@Query() query: ListInstructorApplicationsDto) {
    return this.instructorApplicationsService.listForAdmin(query);
  }

  @Get('certificates/:certificateId/download-url')
  certificateDownloadUrl(
    @Param('certificateId', ParseIntPipe) certificateId: number,
  ) {
    return this.instructorApplicationsService.getAdminCertificateDownloadUrl(
      certificateId,
    );
  }

  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.instructorApplicationsService.getForAdmin(id);
  }

  @Patch(':id/certificates/:certificateId/review')
  reviewCertificate(
    @Param('id', ParseIntPipe) id: number,
    @Param('certificateId', ParseIntPipe) certificateId: number,
    @Body() dto: ReviewCertificateDto,
    @CurrentUser('id') adminUserId: number,
  ) {
    return this.instructorApplicationsService.reviewCertificate(
      id,
      certificateId,
      dto.status,
      adminUserId,
      dto.reason,
      dto.ocrData,
    );
  }

  @Patch(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApproveInstructorApplicationDto,
    @CurrentUser('id') adminUserId: number,
  ) {
    return this.instructorApplicationsService.approve(id, adminUserId, dto);
  }

  @Patch(':id/request-information')
  requestInformation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: InstructorApplicationReasonDto,
    @CurrentUser('id') adminUserId: number,
  ) {
    return this.instructorApplicationsService.requestInformation(
      id,
      dto.reason,
      adminUserId,
    );
  }

  @Patch(':id/reject')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: InstructorApplicationReasonDto,
    @CurrentUser('id') adminUserId: number,
  ) {
    return this.instructorApplicationsService.reject(
      id,
      dto.reason,
      adminUserId,
    );
  }
}
