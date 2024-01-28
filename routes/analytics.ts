import express from "express";
import { getActiveVisitors, getEvents, getMetrics, getPageviews, getStats } from "../controllers/analyticsController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import cache from "../cache/caching.js";

const router = express.Router();

router.get("/active", cache(60), asyncWrapper(getActiveVisitors));

router.get("/events", cache(60), asyncWrapper(getEvents));

router.get("/pageviews", cache(60), asyncWrapper(getPageviews));

router.get("/metrics", cache(60), asyncWrapper(getMetrics));

router.get("/stats", cache(60), asyncWrapper(getStats));

export default router;
