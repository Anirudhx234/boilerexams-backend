import express from 'express'
import asyncWrapper from '../middleware/wrappers/asyncWrapper.js';
import {
    getQuestionStats,
    getExamStats,
    getCourseStats,
    getSubmissionStats
} from '../controllers/statsController.js'
const app = express()

app.get("/stats/questions/:questionId", asyncWrapper(getQuestionStats))

app.get("/stats/exams/:examId", asyncWrapper(getExamStats))

app.get("/stats/courses/:courseId", asyncWrapper(getCourseStats))

app.get("/stats/submissions", asyncWrapper(getSubmissionStats))

export default app