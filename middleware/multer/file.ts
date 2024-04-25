import multer from "multer";
import { Express } from "express"; // Don't remove this
import APIError from "../errors/APIError.js";

const storage = multer.memoryStorage();

const bit = 1 / 8;
const byte = 8 * bit;
const kibibyte = 1024 * byte;
const mebibyte = 1024 * kibibyte;
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
        fileSize: 5 * mebibyte,
    },
});

export default upload;
