import express from "express";
import { deleteExam, getAllExams, getExam, getExamQuestions, getExamTopics } from "../controllers/examController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import sendPublished from "../middleware/auth/sendPublished.js";
import authHandler from "../middleware/auth/authHandler.js";
import { Role } from "@prisma/client";

const router = express.Router();

router.get("/", sendPublished, asyncWrapper(getAllExams));

router.get("/:exam", sendPublished, asyncWrapper(getExam));

router.get("/:exam/topics", asyncWrapper(getExamTopics));

router.get("/:exam/questions", asyncWrapper(getExamQuestions));

router.delete("/:exam", authHandler(Role.CONTENT), asyncWrapper(deleteExam));

export default router;
