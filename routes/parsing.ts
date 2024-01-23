import express from 'express';
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import { attachPDFToExam, getIdResults, parseFromFile, parseFromLink } from '../controllers/parsingController.js';
import upload from '../middleware/multer/pdf.js';

const router = express.Router();

router.post("/convert-link", asyncWrapper(parseFromLink));

router.post("/convert-file", upload.single("pdf"), asyncWrapper(parseFromFile));

router.post("/convert-id", asyncWrapper(getIdResults));

router.post("/exams/:examId/attachPDF", upload.single("pdf"), asyncWrapper(attachPDFToExam));

export default router;