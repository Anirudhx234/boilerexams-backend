import express from 'express';
import asyncWrapper from '../middleware/wrappers/asyncWrapper.js';
import {
    getCourseExamsStats,
    getCourseStats,
    getCourseStatsAll,
    getExamStats,
    getGeneralStats,
    getQuestionStats,
    getSubmissionStats
} from '../controllers/statsController.js';
import cache from '../cache/caching.js'
const app = express();

app.get("/", asyncWrapper(getGeneralStats));

app.get("/courses/all", cache(600), asyncWrapper(getCourseStatsAll));

app.get("/courses/:courseId", cache(600), asyncWrapper(getCourseStats));

app.get("/courses/:courseId/exams/all", cache(600), asyncWrapper(getCourseExamsStats));

app.get("/exams/:examId", cache(600),asyncWrapper(getExamStats));

app.get("/questions/:questionId", cache(600), asyncWrapper(getQuestionStats));

app.get("/submissions", cache(600), asyncWrapper(getSubmissionStats));

export default app;