import express from 'express'
import multer from 'multer'
import asyncWrapper from "../middleware/wrappers/asyncWrapper"
import { getIdResults, parseFromFile, parseFromLink, attachPDFToExam } from '../controllers/parsingController';
import authHandler from '../middleware/auth/authHandler';

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

app.post("/convert-link", authHandler, asyncWrapper(parseFromLink))

app.post("/convert-file", authHandler, upload.single("pdf"), asyncWrapper(parseFromFile))

app.post("/convert-id", authHandler, asyncWrapper(getIdResults))

app.post("/exams/:examId/attachPDF", authHandler, upload.single("pdf"), asyncWrapper(attachPDFToExam))

export default app