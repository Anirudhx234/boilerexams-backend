import multer from "multer";
import { APIError } from "../errors/index.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
    } else {
        cb(new APIError("File type must be JPEG or PNG", 415));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1000 * 1024,
    },
});

export default upload;
