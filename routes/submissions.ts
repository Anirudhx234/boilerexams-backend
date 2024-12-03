import express from "express";
import generalLimiter from "../middleware/rateLimiting/generalLimiter.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import {
    batchCreateSubmission,
    createSubmission, customExamBatchSubmission,
    timedExamBatchSubmission,
    updateSubmission
} from "../controllers/submissionController.js";
import submissionLimiter from "../middleware/rateLimiting/submissionLimiter.js";
import batchSubmissionLimiter from "../middleware/rateLimiting/batchSubmissionLimiter.js";

const router = express.Router();

router.post("/", submissionLimiter, asyncWrapper(createSubmission));

/**
 * @Deprecated
 */
router.post("/batch", batchSubmissionLimiter, asyncWrapper(batchCreateSubmission));

router.post("/timed-exam/:exam", batchSubmissionLimiter, asyncWrapper(timedExamBatchSubmission))

router.post("/custom-exam/:customExam", batchSubmissionLimiter, asyncWrapper(customExamBatchSubmission))

router.put("/:submissionId", generalLimiter, asyncWrapper(updateSubmission));

export default router;
