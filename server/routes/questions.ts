import express from 'express'
import {
    getQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    createQuestionSubmission,
    updateSubmission
} from "../controllers/questionController"
import asyncWrapper from "../middleware/wrappers/asyncWrapper"
const cache = require('../cache/caching');

const app = express();

app.get("/id/questions/:questionId", cache(300), asyncWrapper(getQuestion))

app.post("/courses/:courseId/exams/:examId/questions", asyncWrapper(createQuestion))

app.put("/courses/:courseId/exams/:examId/questions/:questionId", asyncWrapper(updateQuestion))

app.delete("/courses/:courseId/exams/:examId/questions/:questionId", asyncWrapper(deleteQuestion))

app.post("/questions/:questionId/submit", asyncWrapper(createQuestionSubmission))

app.put("/submissions/:submissionId", asyncWrapper(updateSubmission))

export default app;