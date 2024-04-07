import express from "express";
import { generalStats, getCourseStats, getExamStats, getQuestionStats } from "../controllers/statsController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import cache from "../middleware/cache/caching.js";

const router = express.Router();

// ToDo Fix All

router.get("/", cache(600), asyncWrapper(generalStats));

router.get("/courses", cache(600), asyncWrapper(getCourseStats));

router.get("/courses/:c", cache(600), asyncWrapper(getCourseStats));

router.get("/courses/:c/exams/:e", cache(600), asyncWrapper(getExamStats));

router.get("/exams", cache(600), asyncWrapper(getExamStats));

router.get("/exams/:e", cache(600), asyncWrapper(getExamStats));

router.get("/questions", cache(600), asyncWrapper(getQuestionStats));

router.get("/questions/:q", cache(600), asyncWrapper(getQuestionStats));

export default router;
