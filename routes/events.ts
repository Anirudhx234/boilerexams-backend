import express from 'express';
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import {
    createEvents,
    updateEvent,
    deleteEvent,
    deleteAllEvents
} from "../controllers/eventController.js";

const app = express();

app.post("/", asyncWrapper(createEvents));

app.put("/", asyncWrapper(updateEvent));

app.delete("/all", asyncWrapper(deleteAllEvents));

app.delete("/:eventId", asyncWrapper(deleteEvent));

export default app;