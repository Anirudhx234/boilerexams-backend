import express from 'express'
import {
    createTopic,
    updateTopic,
    deleteTopic
} from "../controllers/topicController"
import asyncWrapper from "../middleware/wrappers/asyncWrapper"
import authHandler from '../middleware/auth/authHandler';

const app = express();

app.post("/courses/:courseId/topics", authHandler, asyncWrapper(createTopic))

app.put("/topics/:topicId", authHandler, asyncWrapper(updateTopic))

app.delete("/topics/:topicId", authHandler, asyncWrapper(deleteTopic))

export default app