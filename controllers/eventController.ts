import prisma from "../libs/prisma.js";
import { Request, Response } from "express";
import { NotFoundError } from "../middleware/errors/index.js";

const getEvent = async (req: Request, res: Response) => {
    const { eventId } = req.params;

    const event = await prisma.event.findUnique({
        where: {
            id: eventId,
        },
    });
    if (!event) {
        throw new NotFoundError("Event not found");
    }

    res.status(200).send(event);
};

const getEvents = async (req: Request, res: Response) => {
    const { courseId, after } = req.query;

    // Define an empty where object
    const where = {};

    // Add courseId condition if it exists
    if (courseId) {
        where["courseId"] = courseId;
    }

    // Add start condition if after exists
    if (after) {
        where["start"] = {
            gte: new Date(Number.parseInt(after as string)),
        };
    }

    const events = await prisma.event.findMany({
        where: where,
        orderBy: [
            {
                start: "asc",
            },
        ],
    });

    res.status(200).send(events);
};

const createEvents = async (req: Request, res: Response) => {
    const { events } = req.body;

    const newEvents: NewEvent[] = [];
    for (const event of events) {
        const { courseId, title, description, type, start, end, location } = event;
        const newEvent = {
            courseId: courseId,
            type: type,
            title: title,
            description: description,
            start: new Date(start),
            end: new Date(end),
            location: location,
        };

        newEvents.push(newEvent);
    }

    const createdEvents = await prisma.event.createMany({
        data: newEvents,
    });

    res.status(200).send(createdEvents);
};

const updateEvent = async (req: Request, res: Response) => {
    const { eventId } = req.body;

    const event = await prisma.event.update({
        where: {
            id: eventId,
        },
        data: req.body,
    });
    if (!event) {
        throw new NotFoundError("Event not found");
    }

    res.status(200).send(event);
};

const deleteEvent = async (req: Request, res: Response) => {
    const { eventId } = req.params;

    const event = await prisma.event.delete({
        where: {
            id: eventId,
        },
    });
    if (!event) {
        throw new NotFoundError("Event not found");
    }

    res.status(200).send(event);
};

const deleteAllEvents = async (req: Request, res: Response) => {
    const events = await prisma.event.deleteMany();

    return res.status(200).send(events);
};

export { createEvents, getEvent, getEvents, updateEvent, deleteEvent, deleteAllEvents };
