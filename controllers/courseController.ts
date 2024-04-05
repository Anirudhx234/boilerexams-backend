import prisma from "../prisma/prisma.js";
import type { Request, Response } from "express";
import { APIError, NotFoundError } from "../middleware/errors/index.js";
import { PurdueIoAPI } from "../services/purdue.io.js";
import { StudyMode } from "@prisma/client";
import Resolver from "../helpers/resolver.js";
import FlagEncoder from "../helpers/encoder.js";
import Formatter from "../helpers/formatter.js";
import { z } from "zod";

export const CourseFlags = z.object({
    published: z.boolean().default(false),
});

export const CreateCourse = z.object({
    abbreviation:   z.string(),
    number:         z.number(),
    color:          z.string().optional(),
    disclaimer:     z.string().optional(),
    studyModes:     z.array(z.nativeEnum(StudyMode)).default([ StudyMode.EXAM, StudyMode.TIMED_EXAM, StudyMode.TOPIC ]),
    flags:          CourseFlags.optional().default({  }),
});

export const UpdateCourse = z.object({
    color:      z.string().optional(),
    disclaimer: z.string().optional(),
    studyModes: z.array(z.nativeEnum(StudyMode)).optional(),
    flags:      CourseFlags.optional(),
});


export async function getSubjects(req: Request, res: Response) {
    const courses = await prisma.course.findMany({
        orderBy: [
            {
                subject: "asc",
            },
            {
                number: "asc",
            }
        ],
        include: {
            resources: true
        }
    });

    const formattedCourses = await Formatter.courses({
        data: courses,
        sendUnpublished: req.sendUnpublished,
        computeStats: false
    });

    const subjects = formattedCourses
        ?.reduce((acc, course) => {
            const subjectName = course.subject;
            if (!subjectName) throw new APIError("Subject Name Missing", 500)
            if (!acc[subjectName]) {
                acc[subjectName] = {
                    subject: subjectName,
                    courses: []
                };
            }
            acc[subjectName].courses.push(course);
            return acc;
        }, {} as {  });

    if (!subjects) throw new APIError("No Subjects", 404);

    const uniqueSubjects: Subject[] = Object.values(subjects);

    uniqueSubjects.sort((a, b) => b.courses.length - a.courses.length);

    // Send the sorted result as the response
    res.status(200).send(uniqueSubjects);
}

export async function getCourse(req: Request, res: Response) {
    const { c } = req.params;

    const course = await prisma.course.findUniqueOrThrow({
        where: Resolver.course(c),
        include: {
            events: {
                orderBy: {
                    start: "asc",
                },
            },
            resources: true,
        },
    });

    if (!req.sendUnpublished && !course.flags.published) {
        throw new NotFoundError("Course not found");
    }

    res.status(200).send(await Formatter.course({
        data: course,
        sendUnpublished: req.sendUnpublished,
        computeStats: true
    }));
}

export async function getAllCourses(req: Request, res: Response) {
    const courses = await prisma.course.findMany({
        orderBy: [
            {
                subject: "asc",
            },
            {
                number: "asc",
            }
        ],
        include: {
            events: {
                orderBy: {
                    start: "asc",
                },
            },
            resources: true,
        },
    });

    res.status(200).send(await Formatter.courses({
        data: courses,
        sendUnpublished: req.sendUnpublished,
        computeStats: false
    }));
}

export async function getCourseExams(req: Request, res: Response) {
    const { c } = req.params;

    const course = await prisma.course.findUniqueOrThrow({
        where: Resolver.course(c),
        select: {
            id: true,
            flags: true,
        },
    });

    if (!req.sendUnpublished && !course.flags.published) {
        throw new NotFoundError("Course not found");
    }

    const exams = await prisma.exam.findMany({
        where: {
            courseId: course.id
        },
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
        computeStats: false
    }));
}

export async function getCourseTopics(req: Request, res: Response) {
    const { c } = req.params;

    const course = await prisma.course.findUniqueOrThrow({
        where: Resolver.course(c),
        select: {
            id: true,
            flags: true,
        },
    });

    if (!req.sendUnpublished && !course.flags.published) {
        throw new NotFoundError("Course not found");
    }

    const topics = await prisma.topic.findMany({
        where: {
            courseId: course.id
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

    res.status(200).send(await Formatter.topics({
        data: topics,
        sendUnpublished: req.sendUnpublished,
        computeStats: false
    }));
}

export async function createCourse(req: Request, res: Response) {
    const options = CreateCourse.parse(req.body);

    // PurdueIO confirms existence of course and standardizes name and subject fields
    const purdueIoSubject = await PurdueIoAPI.getSubject(options.abbreviation);
    const purdueIoCourse = await PurdueIoAPI.getCourse(purdueIoSubject, options.number);

    const course = await prisma.course.create({
        data: {
            ...options,
            name: purdueIoCourse.Title,
            subject: purdueIoSubject.Name,
            flags: FlagEncoder.course(options.flags),
        },
        include: {
            exams: true,
            topics: true,
            questions: true,
        },
    });

    res.status(200).send(await Formatter.course({
        data: course,
        sendUnpublished: req.sendUnpublished,
        computeStats: false
    }));
}

export async function updateCourse(req: Request, res: Response) {
    const { c } = req.params;
    const options = UpdateCourse.parse(req.body);

    const course = await prisma.course.update({
        where: Resolver.course(c),
        data: {
            ...options,
            flags: options.flags ? FlagEncoder.course(options.flags) : undefined,
        }
    });

    res.status(200).send(await Formatter.course({
        data: course,
        sendUnpublished: req.sendUnpublished,
        computeStats: false
    }));
}

export async function toggleCoursePublished(req: Request, res: Response) {
    const { c } = req.params;

    const course = await prisma.course.findUnique({
        where: Resolver.course(c),
        select: {
            id: true,
            name: true,
            flags: true
        }
    });

    if (!course) {
        throw new NotFoundError("Course not found");
    }

    const status = !course.flags.published;

    await prisma.course.update({
        where: {
            id: course.id,
        },
        data: {
            flags: FlagEncoder.course({
                ...course.flags,
                published: status
            }),
        },
    });

    res.status(200).send({
        message: `${course.name} is now ${status ? "published" : "unpublished"}`,
    });
}

export async function deleteCourse(req: Request, res: Response) {
    const { c } = req.params;

    const course = await prisma.course.delete({
        where: Resolver.course(c)
    });

    if (!course) {
        throw new NotFoundError("Course not found");
    }

    res.status(200).send(course);
}
