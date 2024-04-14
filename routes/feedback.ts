import {
    createApplication,
    createVideoFeedback,
    deleteFeedback,
    getCourseRequests,
    getFeedback,
    getVideoFeedback,
    reportBug,
    reportQuestion,
    requestCourse,
    requestFeature, updateFeedbackStatus
} from "../controllers/feedbackController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import upload from "../middleware/multer/file.js";
import express from "express";
import authHandler from "../middleware/auth/authHandler.js";
import { Role } from "@prisma/client";

const router = express.Router();

router.get("/:feedbackId", authHandler(Role.CONTENT), asyncWrapper(getFeedback));

router.get("/courses/:course/exams/:e", authHandler(Role.CONTENT), asyncWrapper(getVideoFeedback));

router.get("/courses/:course", authHandler(Role.CONTENT), asyncWrapper(getVideoFeedback));

router.get("/exams/:exam", authHandler(Role.CONTENT), asyncWrapper(getVideoFeedback));

router.get("/course-requests", authHandler(Role.CONTENT), asyncWrapper(getCourseRequests));

router.post("/bug-reports", asyncWrapper(reportBug));

router.post("/question-reports/:question", asyncWrapper(reportQuestion));

router.post("/feature-requests", asyncWrapper(requestFeature));

router.post("/video-feedback/:question", asyncWrapper(createVideoFeedback));

router.post("/course-requests", asyncWrapper(requestCourse));

router.post("/applications", upload.single("pdf"), asyncWrapper(createApplication));

router.patch("/:feedbackId", authHandler(Role.CONTENT), asyncWrapper(updateFeedbackStatus));

router.delete("/:feedbackId", authHandler(Role.CONTENT), asyncWrapper(deleteFeedback));

export default router;
