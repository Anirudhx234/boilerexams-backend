import express from "express";
import {
    generalStats,
    getCourseStats,
    getExamStats,
    getHourlySubmissionStats,
    getQuestionStats,
    getTopicStats
} from "../controllers/statsController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import cache from "../middleware/cache/caching.js";

const router = express.Router();

const minute = 60;

router.get("/", cache(10 * minute), asyncWrapper(generalStats));

router.get("/courses", cache(10 * minute), asyncWrapper(getCourseStats));

router.get("/courses/:c", cache(10 * minute), asyncWrapper(getCourseStats));

router.get("/courses/:c/exams/", cache(10 * minute), asyncWrapper(getExamStats));

router.get("/courses/:c/exams/:e", cache(10 * minute), asyncWrapper(getExamStats));

router.get("/courses/:c/exams/:e/questions", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/courses/:c/exams/:e/questions/:q", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/courses/:c/topics/", cache(10 * minute), asyncWrapper(getTopicStats));

router.get("/courses/:c/topics/:t", cache(10 * minute), asyncWrapper(getTopicStats));

router.get("/courses/:c/topics/:t/questions", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/courses/:c/topics/:t/questions/:q", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/courses/:c/questions/", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/courses/:c/questions/:q", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/exams", cache(10 * minute), asyncWrapper(getExamStats));

router.get("/exams/:e", cache(10 * minute), asyncWrapper(getExamStats));

router.get("/exams/:e/questions", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/exams/:e/questions/:q", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/topics", cache(10 * minute), asyncWrapper(getTopicStats));

router.get("/topics/:t", cache(10 * minute), asyncWrapper(getTopicStats));

router.get("/topics/:t/questions", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/topics/:t/questions/:q", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/questions", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/questions/:q", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/submissions/time", cache(10 * minute), asyncWrapper(getHourlySubmissionStats));

router.get("/submissions/time/:c", cache(10 * minute), asyncWrapper(getHourlySubmissionStats));

export default router;
