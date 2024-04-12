import express from "express";
import {
    getEvents,
    getEvent,
    createEvent,
    batchCreateEvent,
    updateEvent,
    deleteAllEvents,
    deleteEvent,
} from "../controllers/eventController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import authHandler from "../middleware/auth/authHandler.js";
import { Role } from "@prisma/client";

const router = express.Router();

router.get("/", asyncWrapper(getEvents));

router.get("/eventId:", asyncWrapper(getEvent));

router.post("/", authHandler(Role.CONTENT), asyncWrapper(createEvent));

router.post("/batch", authHandler(Role.CONTENT), asyncWrapper(batchCreateEvent));

router.put("/", authHandler(Role.CONTENT), asyncWrapper(updateEvent));

router.delete("/all", authHandler(Role.ADMIN), asyncWrapper(deleteAllEvents));

router.delete("/:eventId", authHandler(Role.CONTENT), asyncWrapper(deleteEvent));

export default router;
