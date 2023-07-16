import express from 'express'
import {
    createExam,
    updateExam,
    deleteExam,
    toggleExamPublished
} from "../controllers/examController"
import asyncWrapper from "../middleware/wrappers/asyncWrapper"

const app = express();

app.post("/courses/:courseId/exams", asyncWrapper(createExam))

app.put("/courses/:courseId/exams/:examId", asyncWrapper(updateExam))

app.put("/courses/:courseId/exams/:examId/togglePublished", asyncWrapper(toggleExamPublished))

app.delete("/courses/:courseId/exams/:examId/hardDelete", asyncWrapper(deleteExam))

export default app