import express from "express";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import { getQuestion } from "../controllers/questionController.js";

const router = express.Router();


//router.get("/courses/:courseResolvable/:topicResolvable/questions", asyncWrapper(getCourseTopicQuestions));

router.get("/questions/:questionResolvable", asyncWrapper(getQuestion));

export default router;
