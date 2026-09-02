import { diskStorage } from 'multer';
import { extname, join } from 'path';

export const avatarUploadConfig = {
  storage: diskStorage({
    destination: join(process.cwd(), 'storage', 'img'),
    filename: (_req, file, cb) => {
      const filename =
        `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
        extname(file.originalname);

      cb(null, filename);
    },
  }),
};
