import express from "express";
import {
    createExam,
    deleteExam, getAllExams,
    getExam,
    getExamQuestions,
    toggleExamPublished,
    updateExam
} from "../controllers/examController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import sendPublished from "../middleware/auth/sendPublished.js";

const router = express.Router();

router.get("/", sendPublished, asyncWrapper(getAllExams));

router.get("/:e", sendPublished, asyncWrapper(getExam));

router.get("/:e/questions", asyncWrapper(getExamQuestions));

export default router;
