import express from "express";
import {
    createCourse,
    deleteCourse, getAllCourses,
    getCourse, getCourseExams,
    toggleCoursePublished,
    updateCourse
} from "../controllers/courseController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import upload from "../middleware/multer/image.js";
import sendPublished from "../middleware/auth/sendPublished.js";
import { getCourseTopics } from "../controllers/display/nameController.js";
import { createExam, deleteExam, toggleExamPublished, updateExam } from "../controllers/examController.js";

const router = express.Router();

router.get("/", sendPublished, asyncWrapper(getAllCourses));

router.get("/:courseResolvable", sendPublished, asyncWrapper(getCourse));

router.get("/courses/:courseResolvable/topics", asyncWrapper(getCourseTopics));

router.get("/courses/:courseResolvable/exams", asyncWrapper(getCourseExams));

router.post("/courses", upload.single("image"), asyncWrapper(createCourse));

router.put("/courses/:courseResolvable", upload.single("image"), asyncWrapper(updateCourse));

router.put("/courses/:courseResolvable/togglePublished", asyncWrapper(toggleCoursePublished));



router.post("/courses/:courseResolvable/exams", asyncWrapper(createExam));

router.put("/courses/:courseId/exams/:examId", asyncWrapper(updateExam));

router.put("/courses/:courseId/exams/:examId/togglePublished", asyncWrapper(toggleExamPublished));

router.delete("/courses/:courseId/exams/:examId/hardDelete", asyncWrapper(deleteExam));

router.delete("/courses/:courseResolvable/hardDelete", asyncWrapper(deleteCourse));

export default router;
