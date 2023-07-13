const express = require('express');
const app = express();
const {
    courseRequests,
    bugReports,
    questionBugReports,
    featureRequests,
    createWebhook,
    updateWebhook
} = require("../controllers/webhookController");

const asyncWrapper = require("../middleware/wrappers/asyncWrapper")

app.post("/courses/requests", asyncWrapper(courseRequests))

app.post("/bug-reports", asyncWrapper(bugReports))

app.post("/bug-reports/questions/:questionId", asyncWrapper(questionBugReports))

app.post("/feature-requests", asyncWrapper(featureRequests))

app.post("/webhooks", asyncWrapper(createWebhook))

app.put("/webhooks/:webhookId", asyncWrapper(updateWebhook))

module.exports = app
export { }