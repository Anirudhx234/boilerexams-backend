import express from 'express'
import {
    createExam,
    updateExam,
    deleteExam,
    toggleExamPublished
} from "../controllers/examController"
import asyncWrapper from "../middleware/wrappers/asyncWrapper"
import authHandler from '../middleware/auth/authHandler';

const app = express();

app.post("/courses/:courseId/exams", authHandler, asyncWrapper(createExam))

app.put("/courses/:courseId/exams/:examId", authHandler, asyncWrapper(updateExam))

app.put("/courses/:courseId/exams/:examId/togglePublished", authHandler, asyncWrapper(toggleExamPublished))

app.delete("/courses/:courseId/exams/:examId/hardDelete", authHandler, asyncWrapper(deleteExam))

export default app