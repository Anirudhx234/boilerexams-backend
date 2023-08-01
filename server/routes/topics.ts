import express from 'express'
import {
    createTopic,
    updateTopic,
    deleteTopic
} from "../controllers/topicController"
import asyncWrapper from "../middleware/wrappers/asyncWrapper"
import authorizedHandler from '../middleware/auth/authHandler';

const app = express();

app.post("/courses/:courseId/topics", authorizedHandler, asyncWrapper(createTopic))

app.put("/topics/:topicId", authorizedHandler, asyncWrapper(updateTopic))

app.delete("/topics/:topicId", authorizedHandler, asyncWrapper(deleteTopic))

export default app