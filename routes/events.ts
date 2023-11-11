import express from 'express';
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import {
    createEvents,
    deleteEvent,
    getAllEvents,
    getEvent,
    getUpcomingEvents,
    updateEvent
} from "../controllers/eventController";

const app = express();

app.post("/", asyncWrapper(createEvents));

app.get("/", asyncWrapper(getAllEvents));

app.get("//:eventId", asyncWrapper(getEvent));

app.get("/after/:date", asyncWrapper(getUpcomingEvents));

app.put("/", asyncWrapper(updateEvent));

app.delete("/:eventId", asyncWrapper(deleteEvent));

export default app;