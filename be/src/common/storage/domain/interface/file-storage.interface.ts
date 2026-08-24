export const FILE_STORAGE = Symbol('FILE_STORAGE');

export interface UploadFileInput {
  key: string;
  body: Buffer;
  contentType: string;
  contentLength?: number;
}

export interface CreateUploadUrlInput {
  key: string;
  contentType: string;
  expiresIn: number;
}

export interface CreateDownloadUrlInput {
  key: string;
  expiresIn: number;
}

export interface FileStorage {
  upload(input: UploadFileInput): Promise<void>;

  createUploadUrl(input: CreateUploadUrlInput): Promise<string>;

  createDownloadUrl(input: CreateDownloadUrlInput): Promise<string>;

  delete(key: string): Promise<void>;

  exists(key: string): Promise<boolean>;
}
