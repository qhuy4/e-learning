import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CertificateRepository } from '@/modules/certificates/infrastructure/repository/certificate.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@Controller('admin/certificates')
@UseGuards(JwtAuthGuard)
export class AdminCertificatesController {
  constructor(
    private readonly certificateRepository: CertificateRepository,
  ) {}

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('keyword') keyword?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.certificateRepository.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      keyword,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const cert = await this.certificateRepository.findById(id);
    if (!cert) {
      throw new AppException(ErrorCode.CERTIFICATE_NOT_FOUND, 404);
    }
    return cert;
  }
}
