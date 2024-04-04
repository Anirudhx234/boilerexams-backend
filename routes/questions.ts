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

router.get("/:q", sendPublished, asyncWrapper(getQuestion));

router.put("/questions/:q/togglePublished", authHandler(Role.CONTENT), asyncWrapper(toggleQuestionPublished));

router.delete("/courses/:c/exams/:e/questions/:q", authHandler(Role.CONTENT), asyncWrapper(deleteQuestion));

router.post("/questions/:q/submit", generalLimiter, asyncWrapper(createSubmission));

router.post("/submissions/batch", generalLimiter, asyncWrapper(batchCreateSubmission));

router.put("/submissions/:submissionId", generalLimiter, asyncWrapper(updateSubmission));

export default router;
