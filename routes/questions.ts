import express from "express";
import { Role } from "@prisma/client";
import {
    batchCreateSubmission,
    createQuestion, createSubmission, deleteQuestion,
    getQuestion, toggleQuestionPublished,
    updateQuestion, updateSubmission
} from "../controllers/questionController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import authHandler from "../middleware/auth/authHandler.js";
import generalLimiter from "../middleware/rateLimiting/generalLimiter.js";
import sendPublished from "../middleware/auth/sendPublished.js";

const router = express.Router();

router.get("/id/questions/:questionResolvable", sendPublished, asyncWrapper(getQuestion));

router.post("/courses/:courseResolvable/exams/:examResolvable/questions", authHandler(Role.CONTENT), asyncWrapper(createQuestion));

router.put("/courses/:courseResolvable/exams/:examResolvable/questions/:questionResolvable", authHandler(Role.CONTENT), asyncWrapper(updateQuestion));

router.put("/questions/:questionResolvable/togglePublished", authHandler(Role.CONTENT), asyncWrapper(toggleQuestionPublished));

router.delete("/courses/:courseResolvable/exams/:examResolvable/questions/:questionResolvable", authHandler(Role.CONTENT), asyncWrapper(deleteQuestion));

router.post("/questions/:questionResolvable/submit", generalLimiter, asyncWrapper(createSubmission));

router.post("/submissions/batch", generalLimiter, asyncWrapper(batchCreateSubmission));

router.put("/submissions/:submissionId", generalLimiter, asyncWrapper(updateSubmission));

export default router;
