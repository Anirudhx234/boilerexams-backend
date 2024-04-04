import prisma from "../prisma/prisma.js";
import Resolver from "../helpers/resolver.js";
import { Request, Response } from "express";
import { APIError, NotFoundError } from "../middleware/errors/index.js";
import {
    CreateExamScheme, ReorderQuestions,
    UpdateExamScheme
} from "../prisma/schema.js";
import FlagEncoder from "../helpers/encoder.js";
import Formatter from "../helpers/formatter.js";
import { z } from "zod";

export const ExamFlags = z.object({
    published:  z.boolean().default(false),
    practice:   z.boolean().default(false),
});

export async function getExam(req: Request, res: Response) {
    const { e, c } = req.params;

    const exam = await prisma.exam.findUniqueOrThrow({
        where: await Resolver.exam(e, c),
        include: {
            resources: true,
            questions: {
                select: {
                    id: true,
                    number: true,
                    flags: true
                },
                orderBy: [
                    { number: "asc" }
                ]
            }
        }
    });

    if (!req.sendUnpublished && !exam.flags.published) {
        throw new NotFoundError("Exam not found");
    }

    res.status(200).send(await Formatter.exam({
        data: exam,
        sendUnpublished: req.sendUnpublished,
        computeStats: true
    }));
}

export async function getAllExams(req: Request, res: Response) {
    const exams = await prisma.exam.findMany({
        include: {
            resources: true,
            questions: {
                select: {
                    id: true,
                    number: true,
                    flags: true
                }
            }
        },
        orderBy: [
            { year: "asc" },
            { season: "asc" },
            { number: "asc" }
        ]
    });

    res.status(200).send(await Formatter.exams({
        data: exams,
        sendUnpublished: req.sendUnpublished,
        computeStats: true
    }));
}

export async function getExamQuestions(req: Request, res: Response) {
    const { e, c } = req.params;

    const exam = await prisma.exam.findUniqueOrThrow({
        where: await Resolver.exam(e, c),
    });

    if (!req.sendUnpublished && !exam.flags.published) {
        throw new NotFoundError("Exam not found");
    }

    const questions = await prisma.question.findMany({
        where: {
            examId: exam.id
        },
        include: {
            resources: true,
            explanation: true,
            children: {
                include: {
                    resources: true,
                        answerChoices: {
                        include: {
                            resources: true
                        }
                    }
                }
            },
            topics: {
                include: {
                    topic: true
                },
                orderBy: {
                    topic: {
                        name: "asc"
                    }
                }
            },
            answerChoices: {
                include: {
                    resources: true
                },
                orderBy: {
                    index: "asc"
                }
            }
        }
    });

    res.status(200).send(await Formatter.questions({
        data: questions,
        sendUnpublished: req.sendUnpublished,
        computeStats: true
    }));
}

export async function createExam(req: Request, res: Response)  {
    const { c } = req.params;
    const options = CreateExamScheme.parse(req.body);

    const course = await prisma.course.findUnique({
        where: Resolver.course(c)
    });

    if (!course) throw new APIError(`Course not found`, 404);

    const exam = await prisma.exam.create({
        data: {
            ...options,
            courseId: course.id,
            flags: FlagEncoder.exam(options.flags),
        },
        include: {
            questions: true
        }
    });

    res.status(200).send(exam);
}

export async function updateExam(req: Request, res: Response) {
    const { c, e } = req.params;
    const options = UpdateExamScheme.parse(req.body);

    /* // ToDo update/create pdf
    const pdf = options.pdf ? await prisma.resource.upsert({
        where: {
            id: options.pdf?.id
        },
        create: {
            ...options.pdf
        },
        update: {
            ...options.pdf
        }
    }) : undefined;

     */

    const exam = await prisma.exam.update({
        where: await Resolver.exam(e, c),
        data: {
            ...options,
            flags: FlagEncoder.exam(options.flags)
        }
    });

    res.status(200).send(await Formatter.exam({
        data: exam,
        sendUnpublished: req.sendUnpublished,
        computeStats: true
    }));
}

export async function reorderQuestions(req: Request, res: Response) {
    const { e, c } = req.params;

    const exam = await prisma.exam.findUnique({
        where: await Resolver.exam(e, c),
        select: {
            id: true,
            questions: {
                select: {
                    id: true,
                    number: true
                }
            }
        }
    });

    if (!exam) {
        throw new NotFoundError(`Exam not found: ${e}`);
    }

    const options = ReorderQuestions.parse(req.body);

    const questions = await prisma.$transaction(exam.questions.map(question => {
        return prisma.question.update({
            where: {
                id: question.id
            },
            data: {
                number: options.indexOf(question.id) + 1
            }
        });
    }));

    res.status(200).send(await Formatter.questions({
        data: questions,
        sendUnpublished: req.sendUnpublished,
        computeStats: true
    }));
}

export async function toggleExamPublished(req: Request, res: Response) {
    const { c, e } = req.params;

    const exam = await prisma.exam.findUnique({
        where: await Resolver.exam(e, c),
        select: {
            id: true,
            flags: true
        }
    });

    if (!exam) {
        throw new NotFoundError("Exam not found");
    }

    const status = !(exam.flags as any).published;

    await prisma.exam.update({
        where: {
            id: exam.id,
        },
        data: {
            flags: FlagEncoder.exam({
                ...(exam.flags as any),
                published: status
            })
        },
    });

    res.status(200).send({
        message: `Exam is now ${status ? "published" : "unpublished"}`,
    });
}

export async function deleteExam(req: Request, res: Response) {
    const { c, e } = req.params;

    const exam = await prisma.exam.delete({
        where: await Resolver.exam(e, c)
    });

    if (!exam) {
        throw new NotFoundError("Exam not found");
    }
    res.status(200).send(exam);
}