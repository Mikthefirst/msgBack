import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const multerChatContentConfig = {
  storage: diskStorage({
    destination: './uploads/chat-content',
    filename: (req, file, callback) => {
      const ext = extname(file.originalname);
      const cleanName = file.originalname.replace(/\s/g, '').replace(ext, '');
      const unique = `${cleanName}_${uuidv4()}${ext}`;
      callback(null, unique);
    },
  }),
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'image/gif',
      'image/jpg',
    ];
    allowedTypes.includes(file.mimetype)
      ? callback(null, true)
      : callback(new Error('Invalid file type'), false);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};
