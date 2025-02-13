import express from "express";
import cache from "../middleware/cache/caching.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import {
    generalStats,
    getCourseStats,
    getExamStats,
    getFeedbackStats,
    getHourlySubmissionStats,
    getQuestionStats, getSubmissionStats,
    getTopicStats,
    getVisitorStats
} from "../controllers/statsController.js";

const router = express.Router();

const minute = 60;

router.get("/", cache(10 * minute), asyncWrapper(generalStats));

router.get("/visitors", asyncWrapper(getVisitorStats));

router.get("/courses", cache(10 * minute), asyncWrapper(getCourseStats));

router.get("/courses/:course", cache(10 * minute), asyncWrapper(getCourseStats));

router.get("/courses/:course/exams/", cache(10 * minute), asyncWrapper(getExamStats));

router.get("/courses/:course/exams/:exam", cache(10 * minute), asyncWrapper(getExamStats));

router.get("/courses/:course/exams/:exam/questions", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/courses/:course/exams/:exam/questions/:question", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/courses/:course/topics/", cache(10 * minute), asyncWrapper(getTopicStats));

router.get("/courses/:course/topics/:topic", cache(10 * minute), asyncWrapper(getTopicStats));

router.get("/courses/:course/topics/:topic/questions", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/courses/:course/topics/:topic/questions/:question", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/courses/:course/questions/", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/courses/:course/questions/:question", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/exams", cache(10 * minute), asyncWrapper(getExamStats));

router.get("/exams/:exam", cache(10 * minute), asyncWrapper(getExamStats));

router.get("/exams/:exam/questions", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/exams/:exam/questions/:question", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/topics", cache(10 * minute), asyncWrapper(getTopicStats));

router.get("/topics/:topic", cache(10 * minute), asyncWrapper(getTopicStats));

router.get("/topics/:topic/questions", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/topics/:topic/questions/:question", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/questions", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/questions/:question", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/submissions", cache(10 * minute), asyncWrapper(getSubmissionStats));

router.get("/submissions/time", cache(10 * minute), asyncWrapper(getHourlySubmissionStats));

router.get("/submissions/time/:course", cache(10 * minute), asyncWrapper(getHourlySubmissionStats));

router.get("/feedback", cache(10 * minute), asyncWrapper(getFeedbackStats));

export default router;
