import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../prisma/prisma.js";
import Formatter from "../helpers/formatter.js";
import Resolver from "../helpers/resolver.js";
import APIError from "../middleware/errors/APIError.js";
import { FullQuestion } from "./questionController.js";
import Scheduler from "../helpers/scheduler.js";
import FlagEncoder from "../helpers/encoder.js";

const FourHours = 4 * 60 * 60 * 1000;

export const CustomExamFlags = z.object({
    permanent: z.boolean().default(false)
});

export const CustomExamData = z.object({
    timeLimit: z.coerce.number().min(0).max(FourHours),
    length: z.enum([ "SHORT", "MEDIUM", "LONG" ]),
    difficulty: z.enum([ "EASY", "MEDIUM", "HARD" ])
});

export const CreateCustomExamOptions = z.object({
    data: CustomExamData,
    name: z.string().max(32),
    flags: CustomExamFlags,
    courseId: z.string().uuid(),
    questionIds: z.array(z.string().uuid()),
});

export const UpdateCustomExamOptions = z.object({
    data: CustomExamData.optional(),
    name: z.string().max(32).optional(),
    flags: CustomExamFlags.optional(),
    questionIds: z.array(z.string().uuid()).optional(),
});

export const FullCustomExam = {
    course: true,
    questions: {
        include: FullQuestion,
    }
}

export async function getCustomExam(req: Request, res: Response) {
    const { updateLastUsed, metadataOnly } = req.query;

    const customExam = await prisma.customExam.update({
        where: await Resolver.customExam(req.params),
        include: FullCustomExam,
        data: {
            referencedAt: Boolean(updateLastUsed) ? new Date() : undefined
        }
    });

    res.status(200).send(
        Formatter.customExam({
            data: customExam,
            sendUnpublished: req.sendUnpublished
        })
    );
}

export async function getAllCustomExams(req: Request, res: Response) {
    const customExams = await prisma.customExam.findMany({
        include: FullCustomExam,
        orderBy: [{ referencedAt: "asc" }, { createdAt: "asc" }]
    });

    res.status(200).send(
        Formatter.customExams({
            data: customExams,
            sendUnpublished: req.sendUnpublished
        })
    );
}

export async function getCustomExamTopics(req: Request, res: Response) {
    const customExam = await prisma.customExam.findUniqueOrThrow({
        where: await Resolver.customExam(req.params)
    });

    const topics = await prisma.topic.findMany({
        where: {
            questions: {
                some: {
                    question: {
                        customExams: {
                            some: {
                                id: customExam.id
                            }
                        }
                    }
                }
            }
        },
        orderBy: {
            name: "asc"
        }
    });

    res.status(200).send(
        Formatter.topics({
            data: topics,
            sendUnpublished: req.sendUnpublished
        })
    );
}

export async function getCustomExamQuestions(req: Request, res: Response) {
    const customExam = await prisma.customExam.findUniqueOrThrow({
        where: await Resolver.customExam(req.params)
    });

    const questions = await prisma.question.findMany({
        where: {
            customExams: {
                some: {
                    id: customExam.id
                }
            }
        },
        include: FullQuestion
    });

    res.status(200).send(
        Formatter.questions({
            data: questions,
            sendUnpublished: req.sendUnpublished
        })
    );
}

export async function createCustomExam(req: Request, res: Response) {
    const options = CreateCustomExamOptions.parse(req.body);

    const course = await prisma.course.findUniqueOrThrow({
        where: Resolver.course(req.params)
    });

    const customExam = await prisma.customExam.create({
        data: {
            name: options.name,
            data: options.data,
            flags: FlagEncoder.customExam(options.flags),
            courseId: course.id,
            questions: {
                connect: options.questionIds.map(questionId => {
                    return {
                        id: questionId
                    }
                })
            },
        },
        include: {
            course: true,
            questions: true
        }
    });

    res.status(200).send(
        Formatter.customExam({
            data: customExam,
            sendUnpublished: req.sendUnpublished
        })
    );
}

export async function updateCustomExam(req: Request, res: Response) {
    const options = UpdateCustomExamOptions.parse(req.body);

    const customExam = await prisma.customExam.update({
        where: await Resolver.customExam(req.params),
        data: {
            name: options.name,
            data: options.data,
            flags: options.flags ? FlagEncoder.customExam(options.flags) : undefined,
            questions: {
                set: options.questionIds?.map(questionId => {
                    return {
                        id: questionId
                    }
                }),
            }
        }
    });

    res.status(200).send(
        Formatter.customExam({
            data: customExam,
            sendUnpublished: req.sendUnpublished
        })
    )
}

export async function deleteCustomExam(req: Request, res: Response) {
    const exam = await prisma.customExam.delete({
        where: await Resolver.customExam(req.params)
    });

    if (!exam) {
        throw new APIError("CustomExam not found", 404);
    }
    res.status(200).send(exam);
}

async function purgeCustomExams() {
    const second = 1000;
    const minute = 60 * second;
    const hour = 60 * minute;
    const day = 24 * hour;
    const twoWeeksAgo = new Date(Date.now() - (14 * day));

    await prisma.customExam.deleteMany({
        where: {
            referencedAt: {
                lte: twoWeeksAgo
            },
            flags: {
                lte: 0 // ToDo this won't work if we add more flags, I hate prisma
            }
        }
    });
}

export function schedulePurgeCustomExams() {
    const date = new Date(); // Current date and time
    const second = 1000;
    const minute = 60 * second;
    const hour = 60 * minute;

    if (date.getMinutes() === 0) {
        // Schedule every hour on the hour
        Scheduler.schedule(purgeCustomExams, 0, hour);
    } else {
        date.setHours(date.getHours() + 1);
        date.setMinutes(0);
        date.setSeconds(0);
        const difference = date.getTime() - new Date().getTime();
        Scheduler.schedule(purgeCustomExams, difference, hour);
    }
}