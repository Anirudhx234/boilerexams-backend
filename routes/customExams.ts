import express from "express";
import { Role } from "@prisma/client";
import authHandler from "../middleware/auth/authHandler.js";
import sendPublished from "../middleware/auth/sendPublished.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import {
    deleteCustomExam,
    getAllCustomExams,
    getCustomExam,
    getCustomExamQuestions,
    getCustomExamTopics, updateCustomExam
} from "../controllers/customExamController.js";

const router = express.Router();

router.get("/", sendPublished, asyncWrapper(getAllCustomExams));

router.get("/:customExam", sendPublished, asyncWrapper(getCustomExam));

router.get("/:customExam/topics", asyncWrapper(getCustomExamTopics));

router.get("/:customExam/questions", asyncWrapper(getCustomExamQuestions));

router.put("/:customExam", authHandler(Role.CONTENT), asyncWrapper(updateCustomExam));

router.delete("/:customExam", authHandler(Role.CONTENT), asyncWrapper(deleteCustomExam));

export default router;
