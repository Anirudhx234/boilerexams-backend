import express from 'express'
import asyncWrapper from "../middleware/wrappers/asyncWrapper"
import { getIdResults, parseFromFile, parseFromLink, attachPDFToExam } from '../controllers/parsingController';
import authHandler from '../middleware/auth/authHandler';
import upload from '../middleware/multer/pdf'

const app = express();

app.post("/convert-link", authHandler, asyncWrapper(parseFromLink))

app.post("/convert-file", authHandler, upload.single("pdf"), asyncWrapper(parseFromFile))

app.post("/convert-id", authHandler, asyncWrapper(getIdResults))

app.post("/exams/:examId/attachPDF", authHandler, upload.single("pdf"), asyncWrapper(attachPDFToExam))

export default app