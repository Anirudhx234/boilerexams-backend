import express from 'express';
import { createApplication, createBugReport, createCourseRequest, createFeatureRequest, createFeedbackReport, createQuestionBugReport, upsertWebhook, deleteWebhook, getCourseRequest, getCourseRequests, getWebhook, getWebhooks } from "../controllers/webhookController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import upload from "../middleware/multer/pdf.js";
const app = express();
app.post("/", asyncWrapper(upsertWebhook));
app.get("/", asyncWrapper(getWebhooks));
app.get("/:webhookId", asyncWrapper(getWebhook));
app.delete("/:webhookId", asyncWrapper(deleteWebhook));
app.post("/apply", upload.single("pdf"), asyncWrapper(createApplication));
app.post("/course-requests", asyncWrapper(createCourseRequest));
app.get("/course-requests", asyncWrapper(getCourseRequests));
app.get("/course-requests/:courseRequestId", asyncWrapper(getCourseRequest));
app.post("/bug-reports", asyncWrapper(createBugReport));
app.post("/bug-reports/questions/:questionId", asyncWrapper(createQuestionBugReport));
app.post("/feature-requests", asyncWrapper(createFeatureRequest));
app.post("/video-feedback/:questionId", asyncWrapper(createFeedbackReport));
export default app;
//# sourceMappingURL=webhooks.js.map