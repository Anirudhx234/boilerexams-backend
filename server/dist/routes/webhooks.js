import express from 'express';
import { createBugReport, createCourseRequest, createFeatureRequest, createFeedbackReport, createQuestionBugReport, createWebhook, deleteWebhook, getCourseRequest, getCourseRequests, getWebhook, getWebhooks } from "../controllers/webhookController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
const app = express();
app.post("/course-requests", asyncWrapper(createCourseRequest));
app.post("/bug-reports", asyncWrapper(createBugReport));
app.post("/bug-reports/questions/:questionId", asyncWrapper(createQuestionBugReport));
app.post("/feature-requests", asyncWrapper(createFeatureRequest));
app.post("/video-feedback/:questionId", asyncWrapper(createFeedbackReport));
app.post("/webhooks", asyncWrapper(createWebhook));
app.get("/course-requests", asyncWrapper(getCourseRequests));
app.get("/course-requests/:courseRequestId", asyncWrapper(getCourseRequest));
app.get("/webhooks", asyncWrapper(getWebhooks));
app.get("/webhooks/:webhookId", asyncWrapper(getWebhook));
app.delete("/webhooks/:webhookId", asyncWrapper(deleteWebhook));
export default app;
//# sourceMappingURL=webhooks.js.map