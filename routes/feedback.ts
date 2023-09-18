import {
    createApplication,
    createBugReport,
    createCourseRequest,
    createFeatureRequest,
    createFeedbackReport,
    createQuestionBugReport,
} from "../controllers/feedbackController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js"
import express from 'express';
import upload from "../middleware/multer/pdf.js";

const app = express();

app.post("/applications", upload.single("pdf"), asyncWrapper(createApplication));

app.post("/course-requests", asyncWrapper(createCourseRequest));

app.post("/bug-reports", asyncWrapper(createBugReport));

app.post("/content-reports/:questionId", asyncWrapper(createQuestionBugReport));

app.post("/feature-requests", asyncWrapper(createFeatureRequest));

app.post("/video-feedback/:questionId", asyncWrapper(createFeedbackReport));

export default app;