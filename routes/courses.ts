import express from "express";
import {
    createCourse,
    deleteCourse, getAllCourses,
    getCourse, getCourseEvents, getCourseExams, getCourseTopics, getSubjects,
    toggleCoursePublished,
    updateCourse
} from "../controllers/courseController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import upload from "../middleware/multer/image.js";
import sendPublished from "../middleware/auth/sendPublished.js";
import {
    createExam,
    deleteExam, getExam,
    getExamQuestions,
    toggleExamPublished,
    updateExam
} from "../controllers/examController.js";
import authHandler from "../middleware/auth/authHandler.js";
import { createQuestion, getQuestion, updateQuestion } from "../controllers/questionController.js";
import { Role } from "@prisma/client";
import { createTopic, getTopic, getTopicQuestions } from "../controllers/topicController.js";

const router = express.Router();


router.get("/", sendPublished, asyncWrapper(getAllCourses));

router.get("/subjects", sendPublished, asyncWrapper(getSubjects));

router.get("/:c", sendPublished, asyncWrapper(getCourse));

router.get("/:c/topics", sendPublished, asyncWrapper(getCourseTopics));

router.get("/:c/topics/:t", sendPublished, asyncWrapper(getTopic));

router.get("/:c/topics/:t/questions", sendPublished, asyncWrapper(getTopicQuestions));

router.get("/:c/exams", sendPublished, asyncWrapper(getCourseExams));

router.get("/:c/exams/:e", sendPublished, asyncWrapper(getExam));

router.get("/:c/exams/:e/questions", sendPublished, asyncWrapper(getExamQuestions));

router.get("/:c/exams/:e/questions/:q", sendPublished, asyncWrapper(getQuestion));

router.get("/:c/events", sendPublished, asyncWrapper(getCourseEvents));

router.put("/:c", upload.array("images", 10), authHandler(Role.CONTENT), asyncWrapper(updateCourse));

router.put("/:c/togglePublished", authHandler(Role.CONTENT), asyncWrapper(toggleCoursePublished));

router.put("/:c/exams/:e", authHandler(Role.CONTENT), asyncWrapper(updateExam));

router.put("/:c/exams/:e/togglePublished", authHandler(Role.CONTENT), asyncWrapper(toggleExamPublished));

router.put("/:c/exams/:e/questions/:q", authHandler(Role.CONTENT), asyncWrapper(updateQuestion));

router.post("/", upload.array("images", 10), authHandler(Role.CONTENT), asyncWrapper(createCourse));

router.post("/:c/exams", authHandler(Role.CONTENT), asyncWrapper(createExam));

router.post("/:c/topics", authHandler(Role.CONTENT), asyncWrapper(createTopic));

router.post("/:c/exams/:e/questions", authHandler(Role.CONTENT), asyncWrapper(createQuestion));

router.delete("/:c/hardDelete", authHandler(Role.CONTENT), asyncWrapper(deleteCourse));

router.delete("/:c/exams/:e/hardDelete", authHandler(Role.CONTENT), asyncWrapper(deleteExam));


export default router;
