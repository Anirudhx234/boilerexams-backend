import prisma from "../prisma/prisma.js";
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
    const { events }: { events: NewEvent[] } = req.body;

    const courses = await prisma.course.findMany();
    const createdEvents = await prisma.event.createMany({
        data: events
            .map(event => { // This maps events to their respective courses and table schema
                const courseId = courses.find(course => {
                    return course.abbreviation == event.subject && course.number == event.number;
                })?.id;
                return {
                    courseId: courseId,
                    title: event.title,
                    description: event.description,
                    type: event.type,
                    start: new Date(event.start),
                    end: new Date(event.end),
                    location: event.location
                };
            })
            .filter(event => !!event.courseId)
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
