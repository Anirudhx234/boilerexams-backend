import express from 'express'
import {
    courseRequests,
    bugReports,
    questionBugReports,
    featureRequests,
    createWebhook,
    getAllWebhooks,
    getWebhook,
    updateWebhook,
    deleteWebhook
} from "../controllers/webhookController";
import asyncWrapper from "../middleware/wrappers/asyncWrapper"

const app = express();

app.post("/courses/requests", asyncWrapper(courseRequests))

app.post("/bug-reports", asyncWrapper(bugReports))

app.post("/bug-reports/questions/:questionId", asyncWrapper(questionBugReports))

app.post("/feature-requests", asyncWrapper(featureRequests))

app.post("/webhooks", asyncWrapper(createWebhook))

app.get("/webhooks/all", asyncWrapper(getAllWebhooks))

app.get("/webhooks/:webhookId", asyncWrapper(getWebhook))

app.put("/webhooks/:webhookId", asyncWrapper(updateWebhook))

app.delete("/webhooks/:webhookId", asyncWrapper(deleteWebhook))

export default app