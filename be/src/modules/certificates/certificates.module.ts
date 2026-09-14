import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateOrmEntity } from '@/modules/certificates/infrastructure/entity/certificate.orm-entity';
import { CertificateRepository } from '@/modules/certificates/infrastructure/repository/certificate.repository';
import { AdminCertificatesController } from '@/modules/certificates/presentation/admin-certificates.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CertificateOrmEntity])],
  controllers: [AdminCertificatesController],
  providers: [CertificateRepository],
  exports: [CertificateRepository],
})
export class CertificatesModule {}
