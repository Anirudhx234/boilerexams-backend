import express from "express";
import { Role } from "@prisma/client";
import authHandler from "../middleware/auth/authHandler.js";
import sendPublished from "../middleware/auth/sendPublished.js";
import upload from "../middleware/multer/file.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import { deleteExam, getAllExams, getExam, getExamQuestions, getExamTopics, attachPDFToExam } from "../controllers/examController.js";
import {
    deleteCustomExam,
    getAllCustomExams,
    getCustomExam,
    getCustomExamQuestions,
    getCustomExamTopics
} from "../controllers/customExamController.js";

const router = express.Router();

router.get("/", sendPublished, asyncWrapper(getAllCustomExams));

router.get("/:customExam", sendPublished, asyncWrapper(getCustomExam));

router.get("/:customExam/topics", asyncWrapper(getCustomExamTopics));

router.get("/:customExam/questions", asyncWrapper(getCustomExamQuestions));

router.delete("/:customExam", authHandler(Role.CONTENT), asyncWrapper(deleteCustomExam));

export default router;
