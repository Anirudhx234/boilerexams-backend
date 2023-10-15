import {
    createApplication,
    createBugReport,
    createCourseRequest,
    createFeatureRequest,
    createQuestionBugReport,
    createReport,
    createVideoFeedbackReport, deleteVideoFeedback,
    getReport, getVideoFeedbackByCourse, getVideoFeedbackByExam,
    updateReport,
} from "../controllers/feedbackController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import express from 'express';
import upload from "../middleware/multer/pdf.js";

const app = express();

app.get("/reports/:reportId", asyncWrapper(getReport));

app.get("/video-feedback/courses/:courseId", asyncWrapper(getVideoFeedbackByCourse));

app.get("/video-feedback/exams/:examId", asyncWrapper(getVideoFeedbackByExam));

app.post("/reports/", asyncWrapper(createReport));

app.post("/applications", upload.single("pdf"), asyncWrapper(createApplication));

app.post("/course-requests", asyncWrapper(createCourseRequest));

app.post("/bug-reports", asyncWrapper(createBugReport));

app.post("/content-reports/:questionId", asyncWrapper(createQuestionBugReport));

app.post("/feature-requests", asyncWrapper(createFeatureRequest));

app.post("/video-feedback/:questionId", asyncWrapper(createVideoFeedbackReport));

app.put("/reports/:reportId", asyncWrapper(updateReport));

app.delete("/video-feedback/:reportId", asyncWrapper(deleteVideoFeedback));

export default app;