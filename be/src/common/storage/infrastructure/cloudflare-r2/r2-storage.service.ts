import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import {
  FileStorage,
  UploadFileInput,
  CreateUploadUrlInput,
  CreateDownloadUrlInput,
} from '../../domain/interface/file-storage.interface';

@Injectable()
export class R2StorageService implements FileStorage {
  private readonly client: S3Client;
  private readonly bucketName: string;
  /**
   * URL gốc của server (APP_URL).
   * Dùng để build storage proxy URL: {appUrl}/storage/{key}
   * Proxy tự generate signed URL → redirect → browser tải ảnh từ R2 private bucket.
   */
  private readonly appUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.getOrThrow<string>('r2.bucketName');

    const endpoint = this.configService.getOrThrow<string>('r2.endpoint');

    const accessKeyId = this.configService.getOrThrow<string>('r2.accessKeyId');

    const secretAccessKey =
      this.configService.getOrThrow<string>('r2.secretAccessKey');

    this.appUrl =
      this.configService.get<string>('r2.appUrl') ?? 'http://localhost:3001';

    this.client = new S3Client({
      region: 'auto',

      endpoint,

      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Trả về URL qua BE storage proxy: {appUrl}/storage/{key}
   * - FE request URL này → BE `/storage/*` handler generate signed URL → redirect → load ảnh
   * - Hoạt động với bucket PRIVATE, không cần public access
   * - Không bao giờ expire (luôn generate fresh signed URL per request)
   */
  getPublicUrl(key: string): string | null {
    if (!key) return null;
    return `${this.appUrl.replace(/\/$/, '')}/storage/${key}`;
  }

  async upload(input: UploadFileInput): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
        ContentLength: input.contentLength,
      }),
    );
  }

  async createUploadUrl(input: CreateUploadUrlInput): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: input.key,
      ContentType: input.contentType,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: input.expiresIn,
    });
  }

  async createDownloadUrl(input: CreateDownloadUrlInput): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: input.key,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: input.expiresIn,
    });
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      return true;
    } catch {
      return false;
    }
  }
}
