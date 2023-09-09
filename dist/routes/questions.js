import express from 'express';
import { getQuestion, createQuestion, updateQuestion, toggleQuestionPublished, deleteQuestion, createQuestionSubmission, updateSubmission, } from "../controllers/questionController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import authHandler from '../middleware/auth/authHandler.js';
import generalLimiter from '../middleware/rateLimiting/generalLimiter.js';
const app = express();
app.get("/id/questions/:questionId", authHandler, asyncWrapper(getQuestion));
app.post("/courses/:courseId/exams/:examId/questions", authHandler, asyncWrapper(createQuestion));
app.put("/courses/:courseId/exams/:examId/questions/:questionId", authHandler, asyncWrapper(updateQuestion));
app.put("/questions/:questionId/togglePublished", authHandler, asyncWrapper(toggleQuestionPublished));
app.delete("/courses/:courseId/exams/:examId/questions/:questionId", authHandler, asyncWrapper(deleteQuestion));
app.post("/questions/:questionId/submit", generalLimiter, asyncWrapper(createQuestionSubmission));
app.put("/submissions/:submissionId", generalLimiter, asyncWrapper(updateSubmission));
export default app;
//# sourceMappingURL=questions.js.map