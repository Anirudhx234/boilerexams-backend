import prisma from "../prisma/prisma.js";
import { Request, Response } from "express";
import APIError from "../middleware/errors/APIError.js";
import { EventType } from "@prisma/client";
import { z } from "zod";

export const CreateEvent = z
    .object({
        type: z.nativeEnum(EventType),
        title: z.string().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        start: z.coerce.date(),
        end: z.coerce.date(),
        courseId: z.string().uuid().optional(),
    })
    .refine((data) => {
        return data.start < data.end;
    }, "Event must start before it ends");

export const UpdateEvent = z
    .object({
        type: z.nativeEnum(EventType).optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        start: z.coerce.date().optional(),
        end: z.coerce.date().optional(),
        courseId: z.string().uuid().optional(),
    })
    .refine((data) => {
        if (data.start && data.end) {
            return data.start < data.end;
        }
        return true;
    }, "Event must start before it ends");

export const EventQueryParams = z.object({
    type: z.nativeEnum(EventType).optional(),
    before: z.preprocess(coerceDateSafely, z.date()).optional(),
    after: z.preprocess(coerceDateSafely, z.date()).optional(),
});

export async function getEvent(req: Request, res: Response) {
    const { eventId } = req.params;

    const event = await prisma.event.findUnique({
        where: {
            id: eventId,
        },
    });

    if (!event) {
        throw new APIError("Event not found", 404);
    }

    res.status(200).send(event);
}

export async function getEvents(req: Request, res: Response) {
    const options = EventQueryParams.parse(req.query);

    const events = await prisma.event.findMany({
        where: {
            type: options.type,
            start: {
                gte: options.after,
            },
            end: {
                lte: options.before,
            },
        },
        orderBy: [
            {
                start: "asc",
            },
        ],
    });

    res.status(200).send(events);
}

export async function createEvent(req: Request, res: Response) {
    const options = CreateEvent.parse(req.body);

    const event = await prisma.event.create({
        data: {
            ...options,
        },
    });

    res.status(200).send(event);
}

export async function batchCreateEvent(req: Request, res: Response) {
    const events = await prisma.$transaction(
        req.body.map((body: unknown) => {
            const options = CreateEvent.parse(body);
            return prisma.event.create({
                data: {
                    ...options,
                },
            });
        }),
    );

    res.status(200).send(events);
}

export async function updateEvent(req: Request, res: Response) {
    const { eventId } = req.body;

    const event = await prisma.event.update({
        where: {
            id: eventId,
        },
        data: req.body,
    });
    if (!event) {
        throw new APIError("Event not found", 404);
    }

    res.status(200).send(event);
}

export async function deleteEvent(req: Request, res: Response) {
    const { eventId } = req.params;

    const event = await prisma.event.delete({
        where: {
            id: eventId,
        },
    });
    if (!event) {
        throw new APIError("Event not found", 404);
    }

    res.status(200).send(event);
}

export async function deleteAllEvents(req: Request, res: Response) {
    const events = await prisma.event.deleteMany();

    return res.status(200).send(events);
}

function coerceDateSafely(input?: unknown) {
    if (!input) return;
    const number = Number.parseInt(input as string);
    return new Date(number);
}
