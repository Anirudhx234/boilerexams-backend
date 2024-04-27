import express from "express";
import generalLimiter from "../middleware/rateLimiting/generalLimiter.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import { batchCreateSubmission, createSubmission, updateSubmission } from "../controllers/submissionController.js";

const router = express.Router();

router.post("/", generalLimiter, asyncWrapper(createSubmission));

router.post("/batch", generalLimiter, asyncWrapper(batchCreateSubmission));

router.put("/:submissionId", generalLimiter, asyncWrapper(updateSubmission));

export default router;
