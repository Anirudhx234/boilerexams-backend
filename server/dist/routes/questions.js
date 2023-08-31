import express from 'express';
import { getQuestion, createQuestion, updateQuestion, toggleQuestionPublished, deleteQuestion, createQuestionSubmission, updateSubmission, } from "../controllers/questionController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import authHandler from '../middleware/auth/authHandler.js';
const app = express();
app.get("/id/questions/:questionId", authHandler, asyncWrapper(getQuestion));
app.post("/courses/:courseId/exams/:examId/questions", authHandler, asyncWrapper(createQuestion));
app.put("/courses/:courseId/exams/:examId/questions/:questionId", authHandler, asyncWrapper(updateQuestion));
app.put("/questions/:questionId/togglePublished", authHandler, asyncWrapper(toggleQuestionPublished));
app.delete("/courses/:courseId/exams/:examId/questions/:questionId", authHandler, asyncWrapper(deleteQuestion));
app.post("/questions/:questionId/submit", asyncWrapper(createQuestionSubmission));
app.put("/submissions/:submissionId", asyncWrapper(updateSubmission));
export default app;
//# sourceMappingURL=questions.js.map