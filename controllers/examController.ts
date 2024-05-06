import { Request, Response } from "express";
import { Season } from "@prisma/client";
import { z } from "zod";
import prisma from "../prisma/prisma.js";
import { ReorderQuestions } from "../prisma/schema.js";
import FlagEncoder from "../helpers/encoder.js";
import Formatter from "../helpers/formatter.js";
import savePDFtoExam from "../helpers/mathpix/savePDFtoExam.js";
import Resolver from "../helpers/resolver.js";
import APIError from "../middleware/errors/APIError.js";
import { FullQuestion, PartialQuestion } from "./questionController.js";
import { UpsertResourceOptions, upsertResources } from "./resourceController.js";

export const ExamFlags = z.object({
    published: z.boolean().default(false),
    practice: z.boolean().default(false)
});

export const CreateExamOptions = z.object({
    number: z.number(),
    year: z.number(),
    season: z.nativeEnum(Season),
    disclaimer: z.string().optional().nullable(),
    flags: ExamFlags.optional().default({})
});

export const UpdateExamOptions = z.object({
    number: z.number().optional(),
    year: z.number().optional(),
    season: z.nativeEnum(Season).optional(),
    disclaimer: z.string().optional().nullable(),
    flags: ExamFlags.optional(),
    resources: z.array(UpsertResourceOptions).optional()
});

export async function getExam(req: Request, res: Response) {
    const exam = await prisma.exam.findUniqueOrThrow({
        where: await Resolver.exam(req.params),
        include: {
            resources: true,
            questions: {
                select: PartialQuestion,
                orderBy: [{ number: "asc" }]
            }
        }
    });

    if (!req.sendUnpublished && !exam.flags.published) {
        throw new APIError("Exam not found", 404);
    }

    res.status(200).send(
        Formatter.exam({
            data: exam,
            sendUnpublished: req.sendUnpublished
        })
    );
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
        orderBy: [{ year: "asc" }, { season: "asc" }, { number: "asc" }]
    });

    res.status(200).send(
        Formatter.exams({
            data: exams,
            sendUnpublished: req.sendUnpublished
        })
    );
}

export async function getExamTopics(req: Request, res: Response) {
    const exam = await prisma.exam.findUniqueOrThrow({
        where: await Resolver.exam(req.params)
    });

    if (!req.sendUnpublished && !exam.flags.published) {
        throw new APIError("Exam not found", 404);
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

export async function getExamQuestions(req: Request, res: Response) {
    const exam = await prisma.exam.findUniqueOrThrow({
        where: await Resolver.exam(req.params)
    });

    if (!req.sendUnpublished && !exam.flags.published) {
        throw new APIError("Exam not found", 404);
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

    res.status(200).send(
        Formatter.questions({
            data: questions,
            sendUnpublished: req.sendUnpublished
        })
    );
}

export async function createExam(req: Request, res: Response) {
    const options = CreateExamOptions.parse(req.body);

    const course = await prisma.course.findUnique({
        where: Resolver.course(req.params)
    });

    if (!course) throw new APIError(`Course not found`, 404);

    const exam = await prisma.exam.create({
        data: {
            ...options,
            courseId: course.id,
            flags: FlagEncoder.exam(options.flags)
        },
        include: {
            questions: true
        }
    });

    res.status(200).send(
        Formatter.exam({
            data: exam,
            sendUnpublished: req.sendUnpublished
        })
    );
}

export async function updateExam(req: Request, res: Response) {
    const options = UpdateExamOptions.parse(req.body);

    const updatedExam = await prisma.exam.update({
        where: await Resolver.exam(req.params),
        data: {
            ...options,
            flags: options.flags ? FlagEncoder.exam(options.flags) : options.flags,
            resources: upsertResources(options.resources)
        },
        include: {
            resources: true
        }
    });

    res.status(200).send(
        Formatter.exam({
            data: updatedExam,
            sendUnpublished: req.sendUnpublished
        })
    );
}

export async function reorderExamQuestions(req: Request, res: Response) {
    const exam = await prisma.exam.findUniqueOrThrow({
        where: await Resolver.exam(req.params),
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

    const options = ReorderQuestions.parse(req.body);

    const questions = await prisma.$transaction(
        exam.questions.map((question) => {
            return prisma.question.update({
                where: {
                    id: question.id
                },
                data: {
                    number: options.indexOf(question.id) + 1
                },
                select: PartialQuestion
            });
        })
    );

    res.status(200).send(
        Formatter.questions({
            data: questions,
            sendUnpublished: req.sendUnpublished
        })
    );
}

export async function toggleExamPublished(req: Request, res: Response) {
    const exam = await prisma.exam.findUniqueOrThrow({
        where: await Resolver.exam(req.params),
        select: {
            id: true,
            flags: true,
            questions: {
                select: {
                    id: true,
                    flags: true
                }
            }
        }
    });

    const status = !exam.flags.published;

    await prisma.$transaction(async (prisma) => {
        // 1. Update the exam
        // 2. Update existing questions
        await prisma.exam.update({
            where: {
                id: exam.id
            },
            data: {
                flags: FlagEncoder.exam({
                    ...exam.flags,
                    published: status
                })
            }
        });

        for (const question of exam.questions) {
            await prisma.question.update({
                where: {
                    id: question.id
                },
                data: {
                    flags: FlagEncoder.question({
                        ...question.flags,
                        published: status
                    })
                }
            });
        }
    });

    res.status(200).send({
        message: `Exam is now ${status ? "published" : "unpublished"}`
    });
}

export async function attachPDFToExam(req: Request, res: Response) {
    const { examId } = req.params;

    if (!req.file) {
        throw new Error("No file attached");
    }
    const exam = await savePDFtoExam(examId, req.file.buffer, req.file.mimetype);
    res.status(200).send(exam);
}

export async function deleteExam(req: Request, res: Response) {
    const exam = await prisma.exam.delete({
        where: await Resolver.exam(req.params)
    });

    if (!exam) {
        throw new APIError("Exam not found", 404);
    }
    res.status(200).send(exam);
}
