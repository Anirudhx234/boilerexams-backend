import generalLimiter from "../middleware/rateLimiting/generalLimiter.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import { batchCreateSubmission, createSubmission, updateSubmission } from "../controllers/submissionController.js";
import router from "./questions.js";
import { getAllSubmissionTimeStats, getCourseSubmissionTimeStats } from "../controllers/statsController.js";

router.post("/", generalLimiter, asyncWrapper(createSubmission));

router.post("/batch", generalLimiter, asyncWrapper(batchCreateSubmission));

router.put("/:submissionId", generalLimiter, asyncWrapper(updateSubmission));

router.get("/submissions/time", asyncWrapper(getAllSubmissionTimeStats));

router.get("/submissions/time/:c", asyncWrapper(getCourseSubmissionTimeStats));