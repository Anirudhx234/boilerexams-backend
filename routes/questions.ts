import express from "express";
import { Role } from "@prisma/client";
import authHandler from "../middleware/auth/authHandler.js";
import sendPublished from "../middleware/auth/sendPublished.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import {
    deleteAnswerChoice,
    deleteQuestion,
    getQuestion,
    toggleQuestionPublished,
    updateQuestion
} from "../controllers/questionController.js";

const router = express.Router();

router.get("/:question", sendPublished, asyncWrapper(getQuestion));

router.put("/:question", authHandler(Role.CONTENT), asyncWrapper(updateQuestion));

router.put("/:question/toggle-published", authHandler(Role.CONTENT), asyncWrapper(toggleQuestionPublished));

router.delete("/:question", authHandler(Role.CONTENT), asyncWrapper(deleteQuestion));

router.delete("/answer-choices/:answerChoiceId", authHandler(Role.CONTENT), asyncWrapper(deleteAnswerChoice));

export default router;
