import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import { R2StorageService } from './infrastructure/cloudflare-r2/r2-storage.service';

import { FILE_STORAGE } from './domain/interface/file-storage.interface';

import { r2StorageConfig } from './infrastructure/cloudflare-r2/r2-storage.config';

@Module({
  imports: [ConfigModule.forFeature(r2StorageConfig)],

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
