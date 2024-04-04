import express from "express";
import {
    createTopic,
    deleteTopic,
    getAllTopics,
    setTopicQuestions,
    updateTopic
} from "../controllers/topicController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import sendPublished from "../middleware/auth/sendPublished.js";

const router = express.Router();

router.get("/", sendPublished, asyncWrapper(getAllTopics));

router.put("/:t", asyncWrapper(updateTopic));

router.put("/:t/setQuestions", asyncWrapper(setTopicQuestions));

router.delete("/:t", asyncWrapper(deleteTopic));

export default router;
