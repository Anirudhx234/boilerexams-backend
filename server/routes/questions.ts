import express from 'express'
import {
    getQuestion,
    createQuestion,
    updateQuestion,
    toggleQuestionPublished,
    deleteQuestion,
    createQuestionSubmission,
    updateSubmission,
} from "../controllers/questionController"
import asyncWrapper from "../middleware/wrappers/asyncWrapper"
import authorizedHandler from '../middleware/auth/authHandler';

const app = express();

app.get("/id/questions/:questionId", asyncWrapper(getQuestion))

app.post("/courses/:courseId/exams/:examId/questions", authorizedHandler, asyncWrapper(createQuestion))

app.put("/courses/:courseId/exams/:examId/questions/:questionId", authorizedHandler, asyncWrapper(updateQuestion))

app.put("/questions/:questionId/togglePublished", authorizedHandler, asyncWrapper(toggleQuestionPublished))

app.delete("/courses/:courseId/exams/:examId/questions/:questionId", authorizedHandler, asyncWrapper(deleteQuestion))

app.post("/questions/:questionId/submit", asyncWrapper(createQuestionSubmission))

app.put("/submissions/:submissionId", asyncWrapper(updateSubmission))

export default app;