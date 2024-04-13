import {
    createCourse,
    deleteCourse,
    getAllCourses,
    getCourse,
    getCourseEvents,
    getCourseExams,
    getCourseTopics, getCourseTopicsByExam,
    getSubjects,
    toggleCoursePublished,
    updateCourse
} from "../controllers/courseController.js";
import {
    createExam,
    deleteExam,
    getExam,
    getExamQuestions, getExamTopics,
    reorderExamQuestions,
    toggleExamPublished,
    updateExam
} from "../controllers/examController.js";
import { createQuestion, getQuestion, updateQuestion } from "../controllers/questionController.js";
import { createTopic, getTopic, getTopicQuestions, reorderTopicQuestions } from "../controllers/topicController.js";
import { Role } from "@prisma/client";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import authHandler from "../middleware/auth/authHandler.js";
import cache from "../middleware/cache/caching.js";
import express from "express";
import sendPublished from "../middleware/auth/sendPublished.js";

const router = express.Router();

const minute = 60;

router.get("/", sendPublished, cache(minute), asyncWrapper(getAllCourses));

router.get("/subjects", sendPublished, cache(minute), asyncWrapper(getSubjects));

router.get("/:c", sendPublished, cache(minute), asyncWrapper(getCourse));

router.get("/:c/topics", sendPublished, cache(minute), asyncWrapper(getCourseTopics));

router.get("/:c/topics/exams", sendPublished, cache(minute), asyncWrapper(getCourseTopicsByExam));

router.get("/:c/topics/:t", sendPublished, cache(minute), asyncWrapper(getTopic));

router.get("/:c/topics/:t/questions", sendPublished, cache(minute), asyncWrapper(getTopicQuestions));

router.get("/:c/exams", sendPublished, cache(minute), asyncWrapper(getCourseExams));

router.get("/:c/exams/:e", sendPublished, cache(minute), asyncWrapper(getExam));

router.get("/:c/exams/:e/topics", sendPublished, cache(minute), asyncWrapper(getExamTopics));

router.get("/:c/exams/:e/questions", sendPublished, cache(minute), asyncWrapper(getExamQuestions));

router.get("/:c/exams/:e/questions/:q", sendPublished, cache(minute), asyncWrapper(getQuestion));

router.get("/:c/events", sendPublished, cache(minute), asyncWrapper(getCourseEvents));

// Content Only Beyond this point

router.put("/:c", authHandler(Role.CONTENT), asyncWrapper(updateCourse));

router.put("/:c/togglePublished", authHandler(Role.CONTENT), asyncWrapper(toggleCoursePublished));

router.put("/:c/exams/:e", authHandler(Role.CONTENT), asyncWrapper(updateExam));

router.put("/:c/exams/:e/togglePublished", authHandler(Role.CONTENT), asyncWrapper(toggleExamPublished));

router.put("/:c/exams/:e/questions/:q", authHandler(Role.CONTENT), asyncWrapper(updateQuestion));

router.post("/", authHandler(Role.CONTENT), asyncWrapper(createCourse));

router.post("/:c/exams", authHandler(Role.CONTENT), asyncWrapper(createExam));

router.post("/:c/topics", authHandler(Role.CONTENT), asyncWrapper(createTopic));

router.post("/:c/exams/:e/reorderQuestions", authHandler(Role.CONTENT), asyncWrapper(reorderExamQuestions));

router.post("/:c/exams/:e/questions", authHandler(Role.CONTENT), asyncWrapper(createQuestion));

router.post("/:c/topics/:t/reorderQuestions", authHandler(Role.CONTENT), asyncWrapper(reorderTopicQuestions));

router.delete("/:c", authHandler(Role.CONTENT), asyncWrapper(deleteCourse));

router.delete("/:c/exams/:e", authHandler(Role.CONTENT), asyncWrapper(deleteExam));

export default router;
