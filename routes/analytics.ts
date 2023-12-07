import express from 'express';
import {getActiveVisitors, getEvents, getMetrics, getPageviews, getStats} from "../controllers/analyticsController.js";
import asyncWrapper from '../middleware/wrappers/asyncWrapper.js';
import cache from '../cache/caching.js';
const app = express();

app.get("/active", cache(60), asyncWrapper(getActiveVisitors));

app.get("/events", cache(60), asyncWrapper(getEvents));

app.get("/pageviews", cache(60), asyncWrapper(getPageviews));

app.get("/metrics", cache(60), asyncWrapper(getMetrics));

app.get("/stats", cache(60), asyncWrapper(getStats));

export default app;
