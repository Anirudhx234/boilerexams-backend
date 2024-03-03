import prisma from "../libs/prisma.js";
import Resolver from "../helpers/resolver.js";
import { Request, Response } from "express";
import { APIError, NotFoundError } from "../middleware/errors/index.js";
import {
    CreateExamScheme,
    UpdateExamScheme,
} from "../prisma/schema.js";

const createExam = async (req: Request, res: Response) => {
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
            flags: 0
        },
        include: {
            questions: true
        }
    });

    res.status(200).send(exam);
};

const updateExam = async (req: Request, res: Response) => {
    const { courseResolvable, examResolvable } = req.params;
    const options = UpdateExamScheme.parse(req.body);

    const exam = await prisma.exam.update({
        where: await Resolver.exam(examResolvable, courseResolvable),
        data: {
            ...options
        }
    });

    res.status(200).send(exam);
};

const toggleExamPublished = async (req: Request, res: Response) => {
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

    await prisma.exam.update({
        where: {
            id: exam.id,
        },
        data: {
            flags: exam.flags ^ 1,
            questions: {
                updateMany: {
                    where: {  },
                    data: {
                        flags: exam.flags ^ 1,
                    },
                },
            },
        },
    });

    res.status(200).send({
        message: `Exam and questions are now ${((exam.flags ^ 1) & 1) == 1 ? "published" : "unpublished"}`,
    });
};

const deleteExam = async (req: Request, res: Response) => {
    const { courseResolvable, examResolvable } = req.params;

    const exam = await prisma.exam.delete({
        where: await Resolver.exam(examResolvable, courseResolvable)
    });

    if (!exam) {
        throw new NotFoundError("Exam not found");
    }
    res.status(200).send(exam);
};

export { createExam, updateExam, toggleExamPublished, deleteExam };
