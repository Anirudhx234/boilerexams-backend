import express from 'express';
import {
    createTopic,
    deleteTopic,
    setTopicQuestions,
    updateTopic
} from "../controllers/topicController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";

const router = express.Router();

router.post("/courses/:courseId/topics", asyncWrapper(createTopic));

router.put("/topics/:topicId", asyncWrapper(updateTopic));

router.put("/topics/:topicId/setQuestions", asyncWrapper(setTopicQuestions));

router.delete("/topics/:topicId", asyncWrapper(deleteTopic));

export default router;