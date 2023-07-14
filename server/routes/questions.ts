import express from 'express'
import {
    getQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    createQuestionSubmission
} from "../controllers/questionController"
import asyncWrapper from "../middleware/wrappers/asyncWrapper"
const cache = require('../cache/caching');

const app = express();

app.get("/id/questions/:questionId", cache(300), asyncWrapper(getQuestion))

app.post("/courses/:courseId/exams/:examId/questions", asyncWrapper(createQuestion))

app.put("/courses/:courseId/exams/:examId/questions/:questionId", asyncWrapper(updateQuestion))

app.delete("/courses/:courseId/exams/:examId/questions/:questionId", asyncWrapper(deleteQuestion))

app.put("/questions/:questionId/submit", asyncWrapper(createQuestionSubmission))

export default app;