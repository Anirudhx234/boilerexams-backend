import express from 'express'
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js"
import { getIdResults, parseFromFile, parseFromLink, attachPDFToExam } from '../controllers/parsingController.js';
import upload from '../middleware/multer/pdf.js'

const app = express();

app.post("/convert-link", asyncWrapper(parseFromLink))

app.post("/convert-file", upload.single("pdf"), asyncWrapper(parseFromFile))

app.post("/convert-id", asyncWrapper(getIdResults))

app.post("/exams/:examId/attachPDF", upload.single("pdf"), asyncWrapper(attachPDFToExam))

export default app