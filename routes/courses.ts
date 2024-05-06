import express from "express";
import { Role } from "@prisma/client";
import authHandler from "../middleware/auth/authHandler.js";
import sendPublished from "../middleware/auth/sendPublished.js";
import cache from "../middleware/cache/caching.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import {
    createCourse,
    deleteCourse,
    getAllCourses,
    getCourse, getCourseCustomExams,
    getCourseEvents,
    getCourseExams,
    getCourseTopics,
    getCourseTopicsByExam,
    getSubjects,
    toggleCoursePublished,
    updateCourse
} from "../controllers/courseController.js";
import {
    createExam,
    deleteExam,
    getExam,
    getExamQuestions,
    getExamTopics,
    reorderExamQuestions,
    toggleExamPublished,
    updateExam
} from "../controllers/examController.js";
import { createQuestion, getQuestion, updateQuestion } from "../controllers/questionController.js";
import { createTopic, getTopic, getTopicQuestions, reorderTopicQuestions } from "../controllers/topicController.js";
import {
    createCustomExam, deleteCustomExam,
    getCustomExam,
    getCustomExamQuestions,
    getCustomExamTopics
} from "../controllers/customExamController.js";

const router = express.Router();

const minute = 60;

router.get("/", sendPublished, cache(minute), asyncWrapper(getAllCourses));

router.get("/subjects", sendPublished, cache(minute), asyncWrapper(getSubjects));

router.get("/:course", sendPublished, cache(minute), asyncWrapper(getCourse));

router.get("/:course/topics", sendPublished, cache(minute), asyncWrapper(getCourseTopics));

router.get("/:course/topics/exams", sendPublished, cache(minute), asyncWrapper(getCourseTopicsByExam));

router.get("/:course/topics/*/questions", sendPublished, cache(minute), asyncWrapper(getTopicQuestions));

router.get("/:course/topics/*", sendPublished, cache(minute), asyncWrapper(getTopic));

router.get("/:course/exams", sendPublished, cache(minute), asyncWrapper(getCourseExams));

router.get("/:course/exams/:exam", sendPublished, cache(minute), asyncWrapper(getExam));

router.get("/:course/exams/:exam/topics", sendPublished, cache(minute), asyncWrapper(getExamTopics));

router.get("/:course/exams/:exam/questions", sendPublished, cache(minute), asyncWrapper(getExamQuestions));

router.get("/:course/exams/:exam/questions/:question", sendPublished, cache(minute), asyncWrapper(getQuestion));

router.get("/:course/events", sendPublished, cache(minute), asyncWrapper(getCourseEvents));

router.get("/:course/custom-exams", sendPublished, cache(minute), asyncWrapper(getCourseCustomExams));

router.get("/:course/custom-exams/:customExam", sendPublished, cache(minute), asyncWrapper(getCustomExam));

router.get("/:course/custom-exams/:customExam/topics", sendPublished, cache(minute), asyncWrapper(getCustomExamTopics));

router.get("/:course/custom-exams/:customExam/questions", sendPublished, cache(minute), asyncWrapper(getCustomExamQuestions));

// Exception
router.post("/:course/custom-exams", asyncWrapper(createCustomExam));

// Content Only Beyond this point

router.put("/:course", authHandler(Role.CONTENT), asyncWrapper(updateCourse));

router.put("/:course/toggle-published", authHandler(Role.CONTENT), asyncWrapper(toggleCoursePublished));

router.put("/:course/exams/:exam", authHandler(Role.CONTENT), asyncWrapper(updateExam));

router.put("/:course/exams/:exam/toggle-published", authHandler(Role.CONTENT), asyncWrapper(toggleExamPublished));

router.put("/:course/exams/:exam/questions/:question", authHandler(Role.CONTENT), asyncWrapper(updateQuestion));

router.post("/", authHandler(Role.CONTENT), asyncWrapper(createCourse));

router.post("/:course/exams", authHandler(Role.CONTENT), asyncWrapper(createExam));

router.post("/:course/topics", authHandler(Role.CONTENT), asyncWrapper(createTopic));

router.post("/:course/exams/:exam/reorder-questions", authHandler(Role.CONTENT), asyncWrapper(reorderExamQuestions));

router.post("/:course/exams/:exam/questions", authHandler(Role.CONTENT), asyncWrapper(createQuestion));

router.post("/:course/topics/*/reorder-questions", authHandler(Role.CONTENT), asyncWrapper(reorderTopicQuestions));

router.delete("/:course", authHandler(Role.CONTENT), asyncWrapper(deleteCourse));

router.delete("/:course/exams/:exam", authHandler(Role.CONTENT), asyncWrapper(deleteExam));

router.delete("/:course/custom-exams/:customExam", authHandler(Role.CONTENT), asyncWrapper(deleteCustomExam));

export default router;
