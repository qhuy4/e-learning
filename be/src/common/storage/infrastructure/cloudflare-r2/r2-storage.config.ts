import { registerAs } from '@nestjs/config';

export const r2StorageConfig = registerAs('r2', () => ({
  accountId: process.env.R2_ACCOUNT_ID,

  accessKeyId: process.env.R2_ACCESS_KEY_ID,

  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,

  bucketName: process.env.R2_BUCKET_NAME,

  endpoint: process.env.R2_ENDPOINT,

  publicUrl: process.env.R2_PUBLIC_URL ?? '',

  /** URL gốc của server này, để build storage proxy URL */
  appUrl: process.env.APP_URL ?? 'http://localhost:3001',

  uploadUrlExpires: Number(process.env.R2_UPLOAD_URL_EXPIRES ?? 3600),

  downloadUrlExpires: Number(process.env.R2_DOWNLOAD_URL_EXPIRES ?? 600),
}));
