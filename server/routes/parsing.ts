import express from 'express'
import multer from 'multer'
import asyncWrapper from "../middleware/wrappers/asyncWrapper"
import { getIdResults, parseFromFile, parseFromLink } from '../controllers/parsingController';

const app = express();
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true)
    } else {
        cb(new multer.MulterError('File type must be PDF'))
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

app.post("/convert-link", asyncWrapper(parseFromLink))

app.post("/convert-file", upload.single("pdf"), asyncWrapper(parseFromFile))

app.post("/convert-id", asyncWrapper(getIdResults))

export default app