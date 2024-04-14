import express from "express";
import { deleteExam, getAllExams, getExam, getExamQuestions, getExamTopics, attachPDFToExam } from "../controllers/examController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import sendPublished from "../middleware/auth/sendPublished.js";
import authHandler from "../middleware/auth/authHandler.js";
import { Role } from "@prisma/client";
import upload from "../middleware/multer/file.js";

const router = express.Router();

router.get("/", sendPublished, asyncWrapper(getAllExams));

router.get("/:exam", sendPublished, asyncWrapper(getExam));

router.get("/:exam/topics", asyncWrapper(getExamTopics));

router.get("/:exam/questions", asyncWrapper(getExamQuestions));

router.put("/:examId/attach-PDF", authHandler(Role.CONTENT), upload.single("pdf"), asyncWrapper(attachPDFToExam));

router.delete("/:exam", authHandler(Role.CONTENT), asyncWrapper(deleteExam));

export default router;
