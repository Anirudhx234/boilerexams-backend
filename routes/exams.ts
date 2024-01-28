import express from "express";
import { createExam, deleteExam, toggleExamPublished, updateExam } from "../controllers/examController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";

const router = express.Router();

router.post("/courses/:courseId/exams", asyncWrapper(createExam));

router.put("/courses/:courseId/exams/:examId", asyncWrapper(updateExam));

router.put("/courses/:courseId/exams/:examId/togglePublished", asyncWrapper(toggleExamPublished));

router.delete("/courses/:courseId/exams/:examId/hardDelete", asyncWrapper(deleteExam));

export default router;
