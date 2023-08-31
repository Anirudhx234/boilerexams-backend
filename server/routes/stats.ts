import express from 'express'
import asyncWrapper from '../middleware/wrappers/asyncWrapper.js';
import {
    getGeneralStats,
    getCourseExamsStats,
    getQuestionStats,
    getExamStats,
    getCourseStats,
    getSubmissionStats
} from '../controllers/statsController.js'
const app = express()

app.get("/stats", asyncWrapper(getGeneralStats))

app.get("/stats/courses/:courseId", asyncWrapper(getCourseStats))

app.get("/stats/:courseId/exams/all", asyncWrapper(getCourseExamsStats))

app.get("/stats/exams/:examId", asyncWrapper(getExamStats))

app.get("/stats/questions/:questionId", asyncWrapper(getQuestionStats))

app.get("/stats/submissions", asyncWrapper(getSubmissionStats))

export default app