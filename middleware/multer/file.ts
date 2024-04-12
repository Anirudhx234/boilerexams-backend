import multer from "multer";
import { Express } from "express"; // Don't remove this
import { APIError } from "../errors/index.js";

const storage = multer.memoryStorage();

const kilobyte = 1000;
const megabyte = kilobyte * kilobyte;
const validFileTypes = ["image/jpeg", "image/png", "application/pdf"];

function fileFilter(_req: Express.Request, file: Express.Multer.File, callback: multer.FileFilterCallback) {
    if (validFileTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new APIError("File type must be JPEG or PNG or PDF", 415));
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * megabyte,
    },
});

export default upload;
