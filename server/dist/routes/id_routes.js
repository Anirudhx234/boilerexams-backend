import express from "express";
import { getCourse, getCourseTopics, getCourseSemesters, getCourseSemesterExams, getExam, getExamQuestions, getCourseTopicQuestions } from "../controllers/display/idController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import authHandler from "../middleware/auth/authHandler.js";
const app = express();
app.get("/id/courses/:courseId", authHandler, asyncWrapper(getCourse));
app.get("/id/courses/:courseId/topics", authHandler, asyncWrapper(getCourseTopics));
app.get("/id/courses/:courseId/semesters", authHandler, asyncWrapper(getCourseSemesters));
app.get("/id/courses/:courseId/:semesterId/exams", authHandler, asyncWrapper(getCourseSemesterExams));
app.get("/id/exams/:examId", authHandler, asyncWrapper(getExam));
app.get("/id/exams/:examId/questions", authHandler, asyncWrapper(getExamQuestions));
app.get("/id/courses/:courseId/:topicId/questions", authHandler, asyncWrapper(getCourseTopicQuestions));
export default app;
//# sourceMappingURL=id_routes.js.map