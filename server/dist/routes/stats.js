import express from 'express';
import asyncWrapper from '../middleware/wrappers/asyncWrapper.js';
import { getGeneralStats, getCourseExamsStats, getQuestionStats, getExamStats, getCourseStats, getSubmissionStats } from '../controllers/statsController.js';
const app = express();
app.get("/", asyncWrapper(getGeneralStats));
app.get("/courses/:courseId", asyncWrapper(getCourseStats));
app.get("/:courseId/exams/all", asyncWrapper(getCourseExamsStats));
app.get("/exams/:examId", asyncWrapper(getExamStats));
app.get("/questions/:questionId", asyncWrapper(getQuestionStats));
app.get("/submissions", asyncWrapper(getSubmissionStats));
export default app;
//# sourceMappingURL=stats.js.map