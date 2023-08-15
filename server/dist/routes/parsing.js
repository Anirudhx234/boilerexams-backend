import express from 'express';
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import { getIdResults, parseFromFile, parseFromLink, attachPDFToExam } from '../controllers/parsingController.js';
import authHandler from '../middleware/auth/authHandler.js';
import upload from '../middleware/multer/pdf.js';
const app = express();
app.post("/convert-link", authHandler, asyncWrapper(parseFromLink));
app.post("/convert-file", authHandler, upload.single("pdf"), asyncWrapper(parseFromFile));
app.post("/convert-id", authHandler, asyncWrapper(getIdResults));
app.post("/exams/:examId/attachPDF", authHandler, upload.single("pdf"), asyncWrapper(attachPDFToExam));
export default app;
//# sourceMappingURL=parsing.js.map