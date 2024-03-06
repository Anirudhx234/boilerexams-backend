import {
    createApplication,
    createVideoFeedback, deleteFeedback, getAllCourseRequests, getAllVideoFeedback,
    getFeedback,
    getVideoFeedbackByCourse,
    getVideoFeedbackByExam,
    reportBug,
    reportQuestion,
    requestCourse,
    requestFeature, updateFeedbackStatus
} from "../controllers/feedbackController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import upload from "../middleware/multer/pdf.js";
import express from "express";
import authHandler from "../middleware/auth/authHandler.js";
import {Role} from "@prisma/client";

const router = express.Router();

router.get("/:feedbackId", authHandler(Role.CONTENT), asyncWrapper(getFeedback));

router.get("/video-feedback/courses/:courseResolvable/exams/:examResolvable", authHandler(Role.CONTENT), asyncWrapper(getVideoFeedbackByExam));

router.get("/video-feedback/courses/:courseResolvable", authHandler(Role.CONTENT), asyncWrapper(getVideoFeedbackByCourse));

router.get("/video-feedback/exams/:examResolvable", authHandler(Role.CONTENT), asyncWrapper(getVideoFeedbackByExam));

router.get("/video-feedback/", authHandler(Role.CONTENT), asyncWrapper(getAllVideoFeedback));

router.get("/course-requests", asyncWrapper(getAllCourseRequests));

router.post("/bug-reports", asyncWrapper(reportBug));

router.post("/question-reports/:questionResolvable", asyncWrapper(reportQuestion));

router.post("/feature-requests", asyncWrapper(requestFeature));

router.post("/video-feedback/:questionResolvable", asyncWrapper(createVideoFeedback));

router.post("/course-requests", asyncWrapper(requestCourse));

router.post("/applications", upload.single("pdf"), asyncWrapper(createApplication));

router.patch("/:feedbackId", authHandler(Role.CONTENT), asyncWrapper(updateFeedbackStatus));

router.delete("/:feedbackId", authHandler(Role.CONTENT), asyncWrapper(deleteFeedback));

export default router;
