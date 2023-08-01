import express from 'express'
import {
    createExam,
    updateExam,
    deleteExam,
    toggleExamPublished
} from "../controllers/examController"
import asyncWrapper from "../middleware/wrappers/asyncWrapper"
import authorizedHandler from '../middleware/auth/authHandler';

const app = express();

app.post("/courses/:courseId/exams", authorizedHandler, asyncWrapper(createExam))

app.put("/courses/:courseId/exams/:examId", authorizedHandler, asyncWrapper(updateExam))

app.put("/courses/:courseId/exams/:examId/togglePublished", authorizedHandler, asyncWrapper(toggleExamPublished))

app.delete("/courses/:courseId/exams/:examId/hardDelete", authorizedHandler, asyncWrapper(deleteExam))

export default app