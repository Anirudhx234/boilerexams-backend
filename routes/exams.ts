import express from "express";
import {
    getAllExams,
    getExam,
    getExamQuestions,
} from "../controllers/examController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import sendPublished from "../middleware/auth/sendPublished.js";
import authHandler from "../middleware/auth/authHandler.js";
import { Role } from "@prisma/client";
import { deleteCourse } from "../controllers/courseController.js";

const router = express.Router();

router.get("/", sendPublished, asyncWrapper(getAllExams));

router.get("/:e", sendPublished, asyncWrapper(getExam));

router.get("/:e/questions", asyncWrapper(getExamQuestions));

router.delete("/:e", authHandler(Role.CONTENT), asyncWrapper(deleteCourse));

export default router;
