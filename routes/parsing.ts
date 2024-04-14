import express from "express";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import { attachPDFToExam, getIdResults, parseFromFile, parseFromLink } from "../controllers/parsingController.js";
import upload from "../middleware/multer/file.js";
import authHandler from "../middleware/auth/authHandler.js";
import { Role } from "@prisma/client";

const router = express.Router();

router.post("/convert-link", authHandler(Role.CONTENT), asyncWrapper(parseFromLink));

router.post("/convert-file", upload.single("pdf"), authHandler(Role.CONTENT), asyncWrapper(parseFromFile));

router.post("/convert-id", authHandler(Role.CONTENT), asyncWrapper(getIdResults));

router.post("/exams/:examId/attachPDF", upload.single("pdf"), authHandler(Role.CONTENT), asyncWrapper(attachPDFToExam));

export default router;
