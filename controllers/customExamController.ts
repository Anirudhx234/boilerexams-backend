import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../prisma/prisma.js";
import Formatter from "../helpers/formatter.js";
import Resolver from "../helpers/resolver.js";
import APIError from "../middleware/errors/APIError.js";
import { FullQuestion, PartialQuestion } from "./questionController.js";

const HalfHour = 30 * 60 * 1000;
const FourHours = 4 * 60 * 60 * 1000;

export const CustomExamData = z.object({
    timeLimit: z.coerce.number().min(HalfHour).max(FourHours),
    length: z.enum([ "SHORT", "MEDIUM", "LONG" ]),
    difficulty: z.enum([ "EASY", "MEDIUM", "HARD" ]),
});

export const CreateCustomExamOptions = z.object({
    data: CustomExamData,
    name: z.string().max(32),
    author: z.string().max(24),
    courseId: z.string().uuid(),
    questionIds: z.array(z.string().uuid()),
});

export async function getCustomExam(req: Request, res: Response) {
    const customExam = await prisma.customExam.findUniqueOrThrow({
        where: await Resolver.customExam(req.params),
        include: {
            course: true,
            questions: {
                select: PartialQuestion,
                orderBy: [{ number: "asc" }]
            }
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
        include: {
            course: true,
            questions: {
                select: {
                    id: true,
                    number: true,
                    flags: true
                },
                orderBy: {
                    number: "asc"
                }
            }
        },
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
        include: FullQuestion,
        orderBy: {
            number: "asc"
        }
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

    const course = await prisma.course.findUnique({
        where: Resolver.course(req.params)
    });

    if (!course) throw new APIError(`Course not found`, 404);

    const customExam = await prisma.customExam.create({
        data: {
            name: options.name,
            author: options.author,
            data: options.data,
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

export async function deleteCustomExam(req: Request, res: Response) {
    const exam = await prisma.customExam.delete({
        where: await Resolver.customExam(req.params)
    });

    if (!exam) {
        throw new APIError("CustomExam not found", 404);
    }
    res.status(200).send(exam);
}