import express from 'express'
import multer from 'multer'
import asyncWrapper from "../middleware/wrappers/asyncWrapper"
import { getIdResults, parseFromFile, parseFromLink, attachPDFToExam } from '../controllers/parsingController';
import authorizedHandler from '../middleware/auth/authorizedHandler';

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

app.post("/convert-link", authorizedHandler, asyncWrapper(parseFromLink))

app.post("/convert-file", authorizedHandler, upload.single("pdf"), asyncWrapper(parseFromFile))

app.post("/convert-id", authorizedHandler, asyncWrapper(getIdResults))

app.post("/exams/:examId/attachPDF", authorizedHandler, upload.single("pdf"), asyncWrapper(attachPDFToExam))

export default app