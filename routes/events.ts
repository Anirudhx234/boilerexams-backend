import express from "express";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import {
    createEvents,
    updateEvent,
    deleteEvent,
    deleteAllEvents,
    getEvents,
    getEvent
} from "../controllers/eventController.js";

const router = express.Router();

router.get("/", asyncWrapper(getEvents));

router.get("/eventId:", asyncWrapper(getEvent));

router.post("/", asyncWrapper(createEvents));

router.put("/", asyncWrapper(updateEvent));

router.delete("/all", asyncWrapper(deleteAllEvents));

router.delete("/:eventId", asyncWrapper(deleteEvent));

export default router;
