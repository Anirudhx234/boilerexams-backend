import prisma from "../libs/prisma.js";
import { Request, Response } from 'express';
import {Event} from "@prisma/client";

const getEvent = async (req: Request, res: Response) => {
    const { eventId } = req.params;

    const event = await prisma.event.findUnique({
        where: {
            id: eventId
        }
    });

    res.status(200).send(event);
};

const getAllEvents = async (req: Request, res: Response) => {
    const events = await prisma.event.findMany({
        where: {  },
        orderBy: [
            {
                start: "asc"
            }
        ]
    });

    res.status(200).send(events);
};

const getUpcomingEvents = async (req: Request, res: Response) => {
    const upcomingEvents = await prisma.event.findMany({
        where: {
            start: {
                gte: new Date()
            }
        },
        orderBy: [
            {
                start: "asc"
            }
        ]
    });

    res.status(200).send(upcomingEvents);
};

const createEvents = async (req: Request, res: Response) => {
    const { events } = req.body;

    const createdEvents = new Array<Event>();

    for (const event of events) {
        const { courseId, title, description, type, start, end, location } = event;
        const course = await prisma.course.findFirst({
            where: {
                id: courseId
            }
        });

        if (course) {
            const event = await prisma.event.create({
                data: {
                    type: type,
                    title: title,
                    description: description,
                    courseId: course.id,
                    start: new Date(start),
                    end: new Date(end),
                    location: location
                }
            });

            createdEvents.push(event);
        }
    }

    
    res.status(200).send(createdEvents);
};

const updateEvent = async (req: Request, res: Response) => {
    const { id } = req.body;

    const event = await prisma.event.update({
        where: {
            id: id
        },
        data: req.body
    });

    res.status(200).send(event);
};

const deleteEvent = async (req: Request, res: Response) => {
    const { eventId } = req.params;

    if (eventId == "all") {
        const events = await prisma.event.deleteMany({
            where: {

            }
        });
        res.status(200).send(events);
    } else {
        const event = await prisma.event.delete({
            where: {
                id: eventId
            }
        });

        res.status(200).send(event);
    }


};

export {
    createEvents,
    getEvent,
    getAllEvents,
    getUpcomingEvents,
    updateEvent,
    deleteEvent
};