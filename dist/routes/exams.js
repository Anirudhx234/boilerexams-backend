import express from 'express';
import { createExam, updateExam, deleteExam, toggleExamPublished } from "../controllers/examController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
const app = express();
app.post("/courses/:courseId/exams", asyncWrapper(createExam));
app.put("/courses/:courseId/exams/:examId", asyncWrapper(updateExam));
app.put("/courses/:courseId/exams/:examId/togglePublished", asyncWrapper(toggleExamPublished));
app.delete("/courses/:courseId/exams/:examId/hardDelete", asyncWrapper(deleteExam));
export default app;
//# sourceMappingURL=exams.js.map