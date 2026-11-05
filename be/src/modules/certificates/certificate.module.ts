import { Module } from '@nestjs/common';
import { OcrSpaceProvider } from './providers/ocr-space.provider';

@Module({
  providers: [OcrSpaceProvider],
  exports: [OcrSpaceProvider],
})
export class CertificateModule {}
