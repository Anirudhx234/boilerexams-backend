import { APIError, NotFoundError } from "../middleware/errors/index.js";
import { FullQuestion, PartialQuestion } from "./questionController.js";
import { Request, Response } from "express";
import { UpsertResourceOptions, upsertResources } from "./resourceController.js";
import { ReorderQuestions } from "../prisma/schema.js";
import { Season } from "@prisma/client";
import { z } from "zod";
import FlagEncoder from "../helpers/encoder.js";
import Formatter from "../helpers/formatter.js";
import prisma from "../prisma/prisma.js";
import Resolver from "../helpers/resolver.js";

export const ExamFlags = z.object({
    published:  z.boolean().default(false),
    practice:   z.boolean().default(false),
});

export const CreateExamOptions = z.object({
    number:     z.number(),
    year:       z.number(),
    season:     z.nativeEnum(Season),
    disclaimer: z.string().optional().nullable(),
    flags:      ExamFlags.optional().default({  })
});

export const UpdateExamOptions = z.object({
    number:     z.number().optional(),
    year:       z.number().optional(),
    season:     z.nativeEnum(Season).optional(),
    disclaimer: z.string().optional().nullable(),
    flags:      ExamFlags.optional(),
    resources:  z.array(UpsertResourceOptions).optional(),
});

export async function getExam(req: Request, res: Response) {
    const { e, c } = req.params;

    const exam = await prisma.exam.findUniqueOrThrow({
        where: await Resolver.exam(e, c),
        include: {
            resources: true,
            questions: {
                select: PartialQuestion,
                orderBy: [
                    { number: "asc" }
                ]
            }
        }
    });

    if (!req.sendUnpublished && !exam.flags.published) {
        throw new NotFoundError("Exam not found");
    }

    res.status(200).send(Formatter.exam({
        data: exam,
        sendUnpublished: req.sendUnpublished
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
                },
                orderBy: {
                    number: "asc"
                }
            }
        },
        orderBy: [
            { year: "asc" },
            { season: "asc" },
            { number: "asc" }
        ]
    });

    res.status(200).send(Formatter.exams({
        data: exams,
        sendUnpublished: req.sendUnpublished
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
        include: FullQuestion,
        orderBy: {
            number: "asc"
        }
    });

    res.status(200).send(Formatter.questions({
        data: questions,
        sendUnpublished: req.sendUnpublished
    }));
}

export async function getExamTopics(req: Request, res: Response) {
    const { e, c } = req.params;

    const exam = await prisma.exam.findUniqueOrThrow({
        where: await Resolver.exam(e, c),
    });

    if (!req.sendUnpublished && !exam.flags.published) {
        throw new NotFoundError("Exam not found");
    }

    const topics = await prisma.topic.findMany({
        where: {
            questions: {
                some: {
                    question: {
                        examId: exam.id
                    }
                }
            }
        },
        include: {
            questions: {
                include: {
                    question: {
                        select: {
                            id: true,
                            flags: true,
                        }
                    }
                },
                orderBy: {
                    number: "asc"
                }
            }
        },
        orderBy: {
            name: "asc",
        },
    });

    res.status(200).send(Formatter.topics({
        data: topics,
        sendUnpublished: req.sendUnpublished
    }));
}

export async function createExam(req: Request, res: Response)  {
    const { c } = req.params;
    const options = CreateExamOptions.parse(req.body);

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
    const { e, c } = req.params;
    const options = UpdateExamOptions.parse(req.body);

    const updatedExam = await prisma.exam.update({
        where: await Resolver.exam(e, c),
        data: {
            ...options,
            flags: options.flags ? FlagEncoder.exam(options.flags) : options.flags,
            resources: upsertResources(options.resources)
        },
        include: {
            resources: true
        }
    });

    res.status(200).send(Formatter.exam({
        data: updatedExam,
        sendUnpublished: req.sendUnpublished
    }));
}

export async function reorderExamQuestions(req: Request, res: Response) {
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
            },
            select: PartialQuestion
        });
    }));

    res.status(200).send(Formatter.questions({
        data: questions,
        sendUnpublished: req.sendUnpublished
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

    const status = !exam.flags.published;

    await prisma.exam.update({
        where: {
            id: exam.id,
        },
        data: {
            flags: FlagEncoder.exam({
                ...exam.flags,
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