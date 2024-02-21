import {
    createApplication,
    createBugReport,
    createCourseRequest,
    createFeatureRequest,
    createQuestionBugReport,
    createReport,
    createVideoFeedbackReport,
    deleteVideoFeedback,
    getReport,
    getVideoFeedbackByCourse,
    getVideoFeedbackByExam,
    updateReport,
    updateVideoFeedbackReport
} from "../controllers/feedbackController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import upload from "../middleware/multer/pdf.js";
import express from "express";
import authHandler from "../middleware/auth/authHandler.js";
import {Role} from "@prisma/client";

const router = express.Router();

router.get("/reports/:reportId", asyncWrapper(getReport));

router.get("/video-feedback/courses/:courseId", asyncWrapper(getVideoFeedbackByCourse));

router.get("/video-feedback/exams/:examId", asyncWrapper(getVideoFeedbackByExam));

router.post("/reports/", asyncWrapper(createReport));

router.post("/applications", upload.single("pdf"), asyncWrapper(createApplication));

router.post("/course-requests", asyncWrapper(createCourseRequest));

router.post("/bug-reports", asyncWrapper(createBugReport));

router.post("/content-reports/:questionId", asyncWrapper(createQuestionBugReport));

router.post("/feature-requests", asyncWrapper(createFeatureRequest));

router.post("/video-feedback/:questionId", asyncWrapper(createVideoFeedbackReport));

router.put("/reports/:reportId", authHandler(Role.CONTENT), asyncWrapper(updateReport));

router.put("/video-feedback/:reportId", authHandler(Role.CONTENT), asyncWrapper(updateVideoFeedbackReport));

router.delete("/video-feedback/:reportId", authHandler(Role.CONTENT), asyncWrapper(deleteVideoFeedback));

export default router;
