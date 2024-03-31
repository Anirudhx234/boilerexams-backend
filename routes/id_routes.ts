import express from "express";
import {
    getCourse,
    getCourseTopicQuestions,
    getCourseTopics,
    getExam,
    getExamQuestions,
} from "../controllers/display/idController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import { getQuestion } from "../controllers/questionController.js";

const router = express.Router();

router.get("/courses/:courseResolvable", asyncWrapper(getCourse));

router.get("/courses/:courseResolvable/topics", asyncWrapper(getCourseTopics));

router.get("/exams/:courseResolvable", asyncWrapper(getExam));

router.get("/exams/:courseResolvable/questions", asyncWrapper(getExamQuestions));

router.get("/courses/:courseResolvable/:topicResolvable/questions", asyncWrapper(getCourseTopicQuestions));

router.get("/questions/:questionResolvable", asyncWrapper(getQuestion));

export default router;
