import express from 'express'
import {
    createTopic,
    updateTopic,
    deleteTopic
} from "../controllers/topicController"
import asyncWrapper from "../middleware/wrappers/asyncWrapper"

const app = express();

app.post("/courses/:courseId/topics", asyncWrapper(createTopic))

app.put("/topics/:topicId", asyncWrapper(updateTopic))

app.delete("/topics/:topicId", asyncWrapper(deleteTopic))

export default app