import express from "express";
import { deleteTopic, getAllTopics, setTopicQuestions, updateTopic } from "../controllers/topicController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import sendPublished from "../middleware/auth/sendPublished.js";
import authHandler from "../middleware/auth/authHandler.js";
import { Role } from "@prisma/client";

const router = express.Router();

router.get("/", sendPublished, asyncWrapper(getAllTopics));

router.put("/*/set-questions", authHandler(Role.CONTENT), asyncWrapper(setTopicQuestions));

router.put("/*", authHandler(Role.CONTENT), asyncWrapper(updateTopic));

router.delete("/*", authHandler(Role.CONTENT), asyncWrapper(deleteTopic));

export default router;
