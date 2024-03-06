import prisma from "../libs/prisma.js";
import Resolver from "../helpers/resolver.js";
import { Request, Response } from "express";
import { APIError, NotFoundError } from "../middleware/errors/index.js";
import {
    CreateExamScheme, ReorderQuestions,
    UpdateExamScheme
} from "../prisma/schema.js";
import FlagEncoder from "../helpers/encoder.js";
import FlagDecoder from "../helpers/decoder.js";

export async function createExam(req: Request, res: Response)  {
    const { courseResolvable } = req.params;
    const options = CreateExamScheme.parse(req.body);

    const course = await prisma.course.findUnique({
        where: Resolver.course(courseResolvable)
    });

    if (!course) throw new APIError(`Course not found`, 404);

    const exam = await prisma.exam.create({
        data: {
            courseId: course.id,
            ...options,
            flags: FlagEncoder.exam(options.flags)
        },
        include: {
            questions: true
        }
    });

    res.status(200).send(exam);
}

export async function updateExam(req: Request, res: Response) {
    const { courseResolvable, examResolvable } = req.params;
    const options = UpdateExamScheme.parse(req.body);

    const exam = await prisma.exam.update({
        where: await Resolver.exam(examResolvable, courseResolvable),
        data: {
            ...options,
            flags: FlagEncoder.exam(options.flags)
        }
    });

    res.status(200).send(exam);
}

export async function reorderQuestions(req: Request, res: Response) {
    const { examResolvable, courseResolvable } = req.params;

    const exam = await prisma.exam.findUnique({
        where: await Resolver.exam(examResolvable, courseResolvable),
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
        throw new NotFoundError(`Exam not found: ${examResolvable}`);
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

    res.status(200).send(questions);
}

export async function toggleExamPublished(req: Request, res: Response) {
    const { courseResolvable, examResolvable } = req.params;

    const exam = await prisma.exam.findUnique({
        where: await Resolver.exam(examResolvable, courseResolvable),
        select: {
            id: true,
            flags: true
        }
    });

    if (!exam) {
        throw new NotFoundError("Exam not found");
    }

    const examFlags = FlagDecoder.exam(exam.flags);
    const status = !examFlags.published;

    await prisma.exam.update({
        where: {
            id: exam.id,
        },
        data: {
            flags: FlagEncoder.exam({
                ...examFlags,
                published: status
            })
        },
    });

    res.status(200).send({
        message: `Exam is now ${status ? "published" : "unpublished"}`,
    });
}

export async function deleteExam(req: Request, res: Response) {
    const { courseResolvable, examResolvable } = req.params;

    const exam = await prisma.exam.delete({
        where: await Resolver.exam(examResolvable, courseResolvable)
    });

    if (!exam) {
        throw new NotFoundError("Exam not found");
    }
    res.status(200).send(exam);
}