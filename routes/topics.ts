import express from "express";
import { deleteTopic, getAllTopics, setTopicQuestions, updateTopic } from "../controllers/topicController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import sendPublished from "../middleware/auth/sendPublished.js";
import authHandler from "../middleware/auth/authHandler.js";
import { Role } from "@prisma/client";

const router = express.Router();

router.get("/", sendPublished, asyncWrapper(getAllTopics));

router.put("/:t", authHandler(Role.CONTENT), asyncWrapper(updateTopic));

router.put("/:t/setQuestions", authHandler(Role.CONTENT), asyncWrapper(setTopicQuestions));

router.delete("/:t", authHandler(Role.CONTENT), asyncWrapper(deleteTopic));

export default router;
