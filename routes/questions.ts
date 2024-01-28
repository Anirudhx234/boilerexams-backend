import express from "express";
import {
    bulkQuestionSubmission,
    createQuestion,
    createQuestionSubmission,
    deleteQuestion,
    getQuestion,
    toggleQuestionPublished,
    updateQuestion,
    updateSubmission,
} from "../controllers/questionController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import authHandler from "../middleware/auth/authHandler.js";
import generalLimiter from "../middleware/rateLimiting/generalLimiter.js";
import sendPublished from "../middleware/auth/sendPublished.js";

const router = express.Router();

router.get("/id/questions/:questionId", sendPublished, asyncWrapper(getQuestion));

router.post("/courses/:courseId/exams/:examId/questions", asyncWrapper(createQuestion));

router.put("/courses/:courseId/exams/:examId/questions/:questionId", authHandler, asyncWrapper(updateQuestion));

router.put("/questions/:questionId/togglePublished", authHandler, asyncWrapper(toggleQuestionPublished));

router.delete("/courses/:courseId/exams/:examId/questions/:questionId", authHandler, asyncWrapper(deleteQuestion));

router.post("/questions/:questionId/submit", generalLimiter, asyncWrapper(createQuestionSubmission));

router.post("/questions/bulkSubmit", generalLimiter, asyncWrapper(bulkQuestionSubmission));

router.put("/submissions/:submissionId", generalLimiter, asyncWrapper(updateSubmission));

export default router;
