import { diskStorage } from "multer";
import path, { extname } from "path";
import { v4 as uuidv4, v4 } from "uuid";

export const multerConfig = {
  storage: diskStorage({
    destination: "./uploads/profileImage",
    filename: (req, file, callback) => {
      console.log(file)
      const ext = extname(file.originalname);
      const filename: string =
        file.originalname.replace(/\s/g, "").replace(ext, '') + uuidv4();
      console.log('itogovoe: ',filename)
      callback(null, `${filename+ext}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];
    allowedMimeTypes.includes(file.mimetype)
      ? callback(null, true)
      : callback(new Error("Invalid file type"), false);
  },
  limits: {
    fileSize: 3 * 1024 * 1024, 
  },
};
