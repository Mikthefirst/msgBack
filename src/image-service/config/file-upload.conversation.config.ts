import { diskStorage } from 'multer';
import path, { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const multerConversationConfig = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      callback(null, './uploads/conversationImage');
    },
    filename: (req, file, callback) => {
      const ext = extname(file.originalname);
      // Берём оригинальное имя (без пробелов/расширения) + уникальный UUID
      const baseName = file.originalname.replace(/\s/g, '').replace(ext, '');
      const filename = `${baseName}-${uuidv4()}${ext}`;
      callback(null, filename);
    },
  }),
  fileFilter: (req, file, callback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Invalid file type for conversation avatar'), false);
    }
  },
  limits: {
    fileSize: 3 * 1024 * 1024, 
  },
};
