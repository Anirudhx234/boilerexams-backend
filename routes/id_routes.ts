import express from "express";
import {
    getCourse,
    getCourseTopics,
    getCourseSemesters,
    getCourseSemesterExams,
    getExam,
    getExamQuestions,
    getCourseTopicQuestions
} from "../controllers/display/idController.js"
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import authHandler from "../middleware/auth/authHandler.js";

const app = express();

app.get("/courses/:courseId", asyncWrapper(getCourse));

app.get("/courses/:courseId/topics", asyncWrapper(getCourseTopics));

app.get("/courses/:courseId/semesters", asyncWrapper(getCourseSemesters));

app.get("/courses/:courseId/:semesterId/exams", asyncWrapper(getCourseSemesterExams));

app.get("/exams/:examId", asyncWrapper(getExam));

app.get("/exams/:examId/questions", asyncWrapper(getExamQuestions));

app.get("/courses/:courseId/:topicId/questions", asyncWrapper(getCourseTopicQuestions));

export default app;