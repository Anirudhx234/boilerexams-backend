import express from 'express'
import {
    createTopic,
    updateTopic,
    setTopicQuestions,
    deleteTopic
} from "../controllers/topicController.js"
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js"

const app = express();

app.post("/courses/:courseId/topics", asyncWrapper(createTopic))

app.put("/topics/:topicId", asyncWrapper(updateTopic))

app.put("/topics/:topicId/setQuestions", asyncWrapper(setTopicQuestions))

app.delete("/topics/:topicId", asyncWrapper(deleteTopic))

export default app