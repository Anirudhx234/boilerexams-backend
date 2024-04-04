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

router.get("/exams", sendPublished, asyncWrapper(getAllExams));

router.get("/exams/:examResolvable", sendPublished, asyncWrapper(getExam));

router.get("/exams/:examResolvable/questions", asyncWrapper(getExamQuestions));

router.post("/courses/:courseResolvable/exams", asyncWrapper(createExam));

router.put("/courses/:courseId/exams/:examId", asyncWrapper(updateExam));

router.put("/courses/:courseId/exams/:examId/togglePublished", asyncWrapper(toggleExamPublished));

router.delete("/courses/:courseId/exams/:examId/hardDelete", asyncWrapper(deleteExam));

export default router;
