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
} from '@/common/storage/domain/interface/file-storage.interface';

@Controller('storage')
export class StorageController {
  constructor(
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  @Get('*')
  async getFile(@Req() req: Request, @Res() res: Response) {
    let key = req.params[0] || (req as any).path || '';
    if (key.startsWith('/storage/')) {
      key = key.replace('/storage/', '');
    }
    key = key.replace(/^\//, '');

    if (!key) {
      throw new NotFoundException('File key is required');
    }
    if (
      key.startsWith('mentor-certificates/') ||
      key.startsWith('instructor-certificates/')
    ) {
      throw new NotFoundException('File not found');
    }

    try {
      const downloadUrl = await this.storage.createDownloadUrl({
        key,
        expiresIn: 3600, // 1 hour
      });

      return res.redirect(downloadUrl);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }
}
