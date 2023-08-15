import express from 'express'
import {
    createTopic,
    updateTopic,
    deleteTopic
} from "../controllers/topicController.js"
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js"
import authHandler from '../middleware/auth/authHandler.js';

const app = express();

app.post("/courses/:courseId/topics", authHandler, asyncWrapper(createTopic))

app.put("/topics/:topicId", authHandler, asyncWrapper(updateTopic))

app.delete("/topics/:topicId", authHandler, asyncWrapper(deleteTopic))

export default app