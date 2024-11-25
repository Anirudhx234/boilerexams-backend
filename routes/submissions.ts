import express from "express";
import generalLimiter from "../middleware/rateLimiting/generalLimiter.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import { batchCreateSubmission, createSubmission, updateSubmission } from "../controllers/submissionController.js";
import submissionLimiter from "../middleware/rateLimiting/submissionLimiter.js";

const router = express.Router();

router.post("/", submissionLimiter, asyncWrapper(createSubmission));

router.post("/batch", submissionLimiter, asyncWrapper(batchCreateSubmission));

router.put("/:submissionId", generalLimiter, asyncWrapper(updateSubmission));

export default router;
