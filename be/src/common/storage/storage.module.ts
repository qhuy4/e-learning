import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import { R2StorageService } from '@/common/storage/infrastructure/cloudflare-r2/r2-storage.service';

import { FILE_STORAGE } from '@/common/storage/domain/interface/file-storage.interface';

import { r2StorageConfig } from '@/common/storage/infrastructure/cloudflare-r2/r2-storage.config';

import { StorageController } from '@/common/storage/presentation/storage.controller';

@Module({
  imports: [ConfigModule.forFeature(r2StorageConfig)],
  controllers: [StorageController],
  providers: [
    R2StorageService,
    {
      provide: FILE_STORAGE,
      useExisting: R2StorageService,
    },
  ],
  exports: [FILE_STORAGE],
})
export class StorageModule {}
