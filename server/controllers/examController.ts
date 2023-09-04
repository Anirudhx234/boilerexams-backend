import prisma from "../libs/prisma.js";
import { Season } from "@prisma/client";
import { Request, Response } from 'express';
import { APIError, NotFoundError } from "../middleware/errors/index.js";

const createExam = async (req: Request, res: Response) => {
    const { courseId } = req.params
    const { semester: { season, year }, number } = req.body

    if (!season || !year) {
        throw new APIError("Season and year required", 400);
    }

    const exam = await prisma.$transaction(async (tx) => {
        const semester = await tx.semester.upsert({
            where: {
                season_year: {
                    season: Season[season.toUpperCase() as keyof typeof Season],
                    year: Number(year)
                }
            },
            update: {},
            create: {
                season: Season[season.toUpperCase() as keyof typeof Season],
                year: Number(year)
            }
        })

        await tx.course.update({
            where: {
                id: courseId
            },
            data: {
                semesters: {
                    connect: {
                        id: semester.id
                    }
                }
            }
        })

        return await tx.exam.create({
            data: {
                courseId: courseId,
                number: Number(number),
                semesterId: semester.id
            },
            include: {
                semester: true,
                questions: true
            }
        })
    })
    res.status(200).send(exam)
}

const updateExam = async (req: Request, res: Response) => {
    const { courseId, examId } = req.params
    const { semester: { season, year }, number } = req.body

    if (!season || !year) {
        throw new APIError("Season and year required", 400);
    }

    const exam = await prisma.$transaction(async (tx) => {
        const semester = await tx.semester.upsert({
            where: {
                season_year: {
                    season: Season[season.toUpperCase() as keyof typeof Season],
                    year: Number(year)
                }
            },
            update: {},
            create: {
                season: Season[season.toUpperCase() as keyof typeof Season],
                year: Number(year)
            }
        })

        await tx.course.update({
            where: {
                id: courseId
            },
            data: {
                semesters: {
                    connect: {
                        id: semester.id
                    }
                }
            }
        })

        return await tx.exam.update({
            where: {
                id: examId
            },
            data: {
                semesterId: semester.id,
                number: number,
            },
            include: {
                semester: true
            }
        })
    })
    res.status(200).send(exam)
}

const toggleExamPublished = async (req: Request, res: Response) => {
    const { examId } = req.params
    const exam = await prisma.exam.findUnique({
        where: {
            id: examId
        },
        select: {
            published: true
        }
    })
    if (!exam) {
        throw new NotFoundError("Exam not found")
    }

    const published = !exam.published
    await prisma.exam.update({
        where: {
            id: examId
        },
        data: {
            published: published,
            questions: {
                updateMany: {
                    where: {
                        published: !published
                    },
                    data: {
                        published: published
                    }
                }
            }
        }
    })
    res.status(200).send({ message: `Exam and questions are now ${published ? "published" : "unpublished"}` })
}

const deleteExam = async (req: Request, res: Response) => {
    const { examId } = req.params
    const exam = await prisma.exam.delete({
        where: {
            id: examId
        }
    })

    if (!exam) {
        throw new NotFoundError("Exam not found")
    }
    res.status(200).send(exam)
}

export {
    createExam,
    updateExam,
    toggleExamPublished,
    deleteExam
}