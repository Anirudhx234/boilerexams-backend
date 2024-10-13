import { Request, Response } from "express";
import { StudyMode } from "@prisma/client";
import { z } from "zod";
import prisma from "../prisma/prisma.js";
import FlagEncoder from "../helpers/encoder.js";
import Formatter from "../helpers/formatter.js";
import Resolver from "../helpers/resolver.js";
import APIError from "../middleware/errors/APIError.js";
import { PurdueIoAPI } from "../services/purdue.io.js";
import { EventQueryParams } from "./eventController.js";
import { connectOrCreateResources, UpsertResourceOptions, upsertResources } from "./resourceController.js";
import { PartialQuestion } from "./questionController.js";
import { FullCustomExam } from "./customExamController.js";

export const CourseFlags = z.object({
    published: z.boolean().default(false),
    invertImageColors: z.boolean().default(false)
});

export const CreateCourseOptions = z.object({
    abbreviation: z.string(),
    number: z.number(),
    color: z.string().min(4).max(9).regex(/^#/).optional(),
    disclaimer: z.string().optional().nullable(),
    studyModes: z.array(z.nativeEnum(StudyMode)).default([StudyMode.EXAM, StudyMode.TIMED_EXAM, StudyMode.TOPIC]),
    resources: z.array(UpsertResourceOptions).optional(),
    flags: CourseFlags.optional().default({})
});

export const UpdateCourseOptions = z.object({
    color: z.string().min(4).max(9).regex(/^#/).optional(),
    disclaimer: z.string().optional().nullable(),
    studyModes: z.array(z.nativeEnum(StudyMode)).optional(),
    resources: z.array(UpsertResourceOptions).optional(),
    flags: CourseFlags.optional()
});

export async function getSubjects(req: Request, res: Response) {
    const courses = await prisma.course.findMany({
        orderBy: [
            {
                subject: "asc"
            },
            {
                number: "asc"
            }
        ],
        include: {
            resources: true
        }
    });

    const formattedCourses = Formatter.courses({
        data: courses,
        sendUnpublished: req.sendUnpublished
    });

    const subjects = formattedCourses?.reduce((acc, course) => {
        const subjectName = course.subject;
        if (!subjectName) throw new APIError("Subject Name Missing", 500);
        if (!acc[subjectName]) {
            acc[subjectName] = {
                subject: subjectName,
                courses: []
            };
        }
        acc[subjectName].courses.push(course);
        return acc;
    }, {} as object);

    if (!subjects) throw new APIError("No Subjects", 404);

    const uniqueSubjects: Subject[] = Object.values(subjects);

    uniqueSubjects.sort((a, b) => b.courses.length - a.courses.length);

    // Send the sorted result as the response
    res.status(200).send(uniqueSubjects);
}

export async function getCourse(req: Request, res: Response) {

    const course = await prisma.course.findUniqueOrThrow({
        where: Resolver.course(req.params),
        include: {
            events: {
                orderBy: {
                    start: "asc"
                }
            },
            resources: true
        }
    });

    if (!req.sendUnpublished && !course.flags.published) {
        throw new APIError("Course not found", 404);
    }

    res.status(200).send(
        Formatter.course({
            data: course,
            sendUnpublished: req.sendUnpublished
        })
    );
}

export async function getAllCourses(req: Request, res: Response) {
    const courses = await prisma.course.findMany({
        orderBy: [
            {
                subject: "asc"
            },
            {
                number: "asc"
            }
        ],
        include: {
            events: {
                orderBy: {
                    start: "asc"
                }
            },
            resources: true
        }
    });

    res.status(200).send(
        Formatter.courses({
            data: courses,
            sendUnpublished: req.sendUnpublished
        })
    );
}

export async function getCourseExams(req: Request, res: Response) {
    const course = await prisma.course.findUniqueOrThrow({
        where: Resolver.course(req.params)
    });

    if (!req.sendUnpublished && !course.flags.published) {
        throw new APIError("Course not found", 404);
    }

    if (!course.studyModes.includes(StudyMode.EXAM) && !req.sendUnpublished) {
        throw new APIError("Route disabled for this course", 403);
    }

    const exams = await prisma.exam.findMany({
        where: {
            courseId: course.id
        },
        include: {
            resources: true,
            questions: {
                where: {
                    parentId: null
                },
                select: PartialQuestion,
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

export async function getCourseCustomExams(req: Request, res: Response) {
    const course = await prisma.course.findUniqueOrThrow({
        where: Resolver.course(req.params)
    });

    if (!req.sendUnpublished && !course.flags.published) {
        throw new APIError("Course not found", 404);
    }

    if (!req.sendUnpublished) {
        throw new APIError("Route disabled for this course", 403);
    }

    const { permanentOnly } = req.query;

    const customExams = await prisma.customExam.findMany({
        where: {
            courseId: course.id,
        },
        include: FullCustomExam,
        orderBy: [{ referencedAt: "asc" }, { createdAt: "asc" }]
    });

    res.status(200).send(
        Formatter.customExams({
            data: customExams,
            sendUnpublished: req.sendUnpublished,
            permanentOnly: Boolean(permanentOnly)
        })
    );
}

export async function getCourseTopics(req: Request, res: Response) {
    const course = await prisma.course.findUniqueOrThrow({
        where: Resolver.course(req.params)
    });

    if (!req.sendUnpublished && !course.flags.published) {
        throw new APIError("Course not found", 404);
    }

    if (!course.studyModes.includes(StudyMode.TOPIC) && !req.sendUnpublished) {
        throw new APIError("Route disabled for this course", 403);
    }

    const topics = await prisma.topic.findMany({
        where: {
            courseId: course.id
        },
        include: {
            questions: {
                where: {
                    question: {
                        parentId: null
                    }
                },
                include: {
                    question: {
                        select: PartialQuestion
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

export async function getCourseTopicsByExam(req: Request, res: Response) {
    const course = await prisma.course.findUniqueOrThrow({
        where: Resolver.course(req.params)
    });

    if (!req.sendUnpublished && !course.flags.published) {
        throw new APIError("Course not found", 404);
    }

    if (!course.studyModes.includes(StudyMode.TOPIC) && !req.sendUnpublished) {
        throw new APIError("Route disabled for this course", 403);
    }

    const topics = await prisma.topic
        .findMany({
            where: {
                courseId: course.id
            },
            include: {
                questions: {
                    where: {
                        question: {
                            parentId: null
                        }
                    },
                    include: {
                        question: {
                            select: {
                                ...PartialQuestion,
                                exam: {
                                    select: {
                                        number: true,
                                        flags: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                name: "asc"
            }
        })
        .then((topics) => {
            return Formatter.topics({
                data: topics,
                sendUnpublished: req.sendUnpublished
            });
        });

    const buckets = {}; // buckets["i"] will be an array of topics on exam i

    topics?.forEach((topic) => {
        const exams: string[] = [];
        topic.questions?.forEach((question) => {
            const examNumber = question.exam?.number?.toString();
            if (!examNumber || exams.includes(examNumber)) return;
            exams.push(examNumber);
            if (!buckets[examNumber]) {
                buckets[examNumber] = [];
            }
            buckets[examNumber].push({
                ...topic,
                questions: topic.questions?.map((question) => {
                    return {
                        ...question,
                        exam: undefined // Shave off extra info
                    };
                })
            });
        });
    });

    res.status(200).json(buckets);
}

export async function getCourseEvents(req: Request, res: Response) {
    const options = EventQueryParams.parse(req.query);

    const course = await prisma.course.findUniqueOrThrow({
        where: Resolver.course(req.params),
        select: {
            id: true,
            flags: true
        }
    });

    if (!req.sendUnpublished && !course.flags.published) {
        throw new APIError("Course not found", 404);
    }

    const events = await prisma.event.findMany({
        where: {
            ...options,
            courseId: course.id
        },
        orderBy: {
            start: "asc"
        }
    });

    res.status(200).send(events);
}

export async function createCourse(req: Request, res: Response) {
    const options = CreateCourseOptions.parse(req.body);

    // PurdueIO confirms existence of course and standardizes name and subject fields
    const purdueIoSubject = await PurdueIoAPI.getSubject(options.abbreviation);
    const purdueIoCourse = await PurdueIoAPI.getCourse(purdueIoSubject, options.number);

    const course = await prisma.course.create({
        data: {
            ...options,
            name: purdueIoCourse.Title,
            subject: purdueIoSubject.Name,
            flags: FlagEncoder.course(options.flags),
            resources: connectOrCreateResources(options.resources)
        },
        include: {
            exams: true,
            topics: true,
            questions: true,
            resources: true
        }
    });

    res.status(200).send(
        Formatter.course({
            data: course,
            sendUnpublished: req.sendUnpublished
        })
    );
}

export async function updateCourse(req: Request, res: Response) {
    const options = UpdateCourseOptions.parse(req.body);

    const course = await prisma.course.update({
        where: Resolver.course(req.params),
        data: {
            ...options,
            flags: options.flags ? FlagEncoder.course(options.flags) : undefined,
            resources: upsertResources(options.resources)
        }
    });

    res.status(200).send(
        Formatter.course({
            data: course,
            sendUnpublished: req.sendUnpublished
        })
    );
}

export async function toggleCoursePublished(req: Request, res: Response) {
    const course = await prisma.course.findUnique({
        where: Resolver.course(req.params),
        select: {
            id: true,
            name: true,
            flags: true
        }
    });

    if (!course) {
        throw new APIError("Course not found", 404);
    }

    const status = !course.flags.published;

    await prisma.course.update({
        where: {
            id: course.id
        },
        data: {
            flags: FlagEncoder.course({
                ...course.flags,
                published: status
            })
        }
    });

    res.status(200).send({
        message: `${course.name} is now ${status ? "published" : "unpublished"}`
    });
}

export async function deleteCourse(req: Request, res: Response) {
    const course = await prisma.course.delete({
        where: Resolver.course(req.params)
    });

    if (!course) {
        throw new APIError("Course not found", 404);
    }

    res.status(200).send(course);
}
