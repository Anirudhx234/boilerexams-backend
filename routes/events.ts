import express from "express";
import { Role } from "@prisma/client";
import authHandler from "../middleware/auth/authHandler.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import {
    getEvents,
    getEvent,
    createEvent,
    batchCreateEvent,
    updateEvent,
    deleteAllEvents,
    deleteEvent
} from "../controllers/eventController.js";

const router = express.Router();

router.get("/", asyncWrapper(getEvents));

router.get("/:eventId", asyncWrapper(getEvent));

router.post("/", authHandler(Role.CONTENT), asyncWrapper(createEvent));

router.post("/batch", authHandler(Role.CONTENT), asyncWrapper(batchCreateEvent));

router.put("/", authHandler(Role.CONTENT), asyncWrapper(updateEvent));

router.delete("/all", authHandler(Role.ADMIN), asyncWrapper(deleteAllEvents));

router.delete("/:eventId", authHandler(Role.CONTENT), asyncWrapper(deleteEvent));

export default router;
