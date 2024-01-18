import express from "express";
import {
    getCourse,
    getCourseSemesterExams,
    getCourseSemesters,
    getCourseTopicQuestions,
    getCourseTopics,
    getExam,
    getExamQuestions
} from "../controllers/display/idController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";

const router = express.Router();

router.get("/courses/:courseId", asyncWrapper(getCourse));

router.get("/courses/:courseId/topics", asyncWrapper(getCourseTopics));

router.get("/courses/:courseId/semesters", asyncWrapper(getCourseSemesters));

router.get("/courses/:courseId/:semesterId/exams", asyncWrapper(getCourseSemesterExams));

router.get("/exams/:examId", asyncWrapper(getExam));

router.get("/exams/:examId/questions", asyncWrapper(getExamQuestions));

router.get("/courses/:courseId/:topicId/questions", asyncWrapper(getCourseTopicQuestions));

export default router;