import { Role } from "@prisma/client";
import {
    deleteAnswerChoice,
    deleteQuestion,
    getQuestion,
    toggleQuestionPublished,
    updateQuestion,
} from "../controllers/questionController.js";
import { createSubmission } from "../controllers/submissionController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import authHandler from "../middleware/auth/authHandler.js";
import express from "express";
import generalLimiter from "../middleware/rateLimiting/generalLimiter.js";
import sendPublished from "../middleware/auth/sendPublished.js";

const router = express.Router();

router.get("/:q", sendPublished, asyncWrapper(getQuestion));

router.put("/:q", authHandler(Role.CONTENT), asyncWrapper(updateQuestion));

router.put("/:q/togglePublished", authHandler(Role.CONTENT), asyncWrapper(toggleQuestionPublished));

router.post("/:q/submit", generalLimiter, asyncWrapper(createSubmission));

router.delete("/:questionId", authHandler(Role.CONTENT), asyncWrapper(deleteQuestion));

router.delete("/answerChoices/:answerChoiceId", authHandler(Role.CONTENT), asyncWrapper(deleteAnswerChoice));

export default router;
