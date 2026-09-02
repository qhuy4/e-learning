import {
  Controller,
  Get,
  Req,
  Res,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  FILE_STORAGE,
  FileStorage,
} from '../domain/interface/file-storage.interface';

@Controller('storage')
export class StorageController {
  constructor(
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  @Get('*')
  async getFile(@Req() req: Request, @Res() res: Response) {
    const key = req.params[0];

    if (!key) {
      throw new NotFoundException('File key is required');
    }

    const exists = await this.storage.exists(key);
    if (!exists) {
      throw new NotFoundException('File not found');
    }

    const downloadUrl = await this.storage.createDownloadUrl({
      key,
      expiresIn: 3600, // 1 hour
    });

    return res.redirect(downloadUrl);
  }
}
