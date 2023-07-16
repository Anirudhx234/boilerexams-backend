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

const app = express();

app.get("/id/questions/:questionId", asyncWrapper(getQuestion))

app.post("/courses/:courseId/exams/:examId/questions", asyncWrapper(createQuestion))

app.put("/courses/:courseId/exams/:examId/questions/:questionId", asyncWrapper(updateQuestion))

app.put("/courses/:courseId/exams/:examId/questions/:questionId/togglePublished", asyncWrapper(toggleQuestionPublished))

app.delete("/courses/:courseId/exams/:examId/questions/:questionId", asyncWrapper(deleteQuestion))

app.post("/questions/:questionId/submit", asyncWrapper(createQuestionSubmission))

app.put("/submissions/:submissionId", asyncWrapper(updateSubmission))

export default app;