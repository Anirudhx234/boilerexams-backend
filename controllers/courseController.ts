import prisma from "../libs/prisma";
import uploadFileToS3 from "../utils/uploadFileToS3";
import type { Request, Response } from "express";
import { NotFoundError } from "../middleware/errors/index";
import { PurdueIoAPI } from "../services/purdue.io";
import {
    CreateCourseScheme,
    UpdateCourseScheme
} from "../prisma/schema";
import Resolver from "../helpers/resolver.js";
import FlagEncoder from "../helpers/encoder.js";

// ToDo handle multiple graphic resource uploads that are file-based
export async function uploadGraphic(graphicLink?: string, file?: any) {
    if (file) {
        const data = await uploadFileToS3(file.buffer, file.mimetype);
        return data.Location;
    }
    return graphicLink;
}

export async function getCourse(req: Request, res: Response) {
    const { courseResolvable } = req.params;

    const course = await prisma.course.findUniqueOrThrow({
        where: Resolver.course(courseResolvable),
        include: {
            events: {
                orderBy: {
                    start: "asc",
                },
            },
        },
    });

    if (!course.flags.published) {
        throw new NotFoundError("Course not found");
    }

    res.status(200).send(course);
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
        },
    });

    res.status(200).send(courses.filter(course => course.flags.published));
}

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

    const subjects = courses.reduce((acc, course) => {
        const subjectName = course.subject;
        if (!acc[subjectName]) {
            acc[subjectName] = {
                subject: subjectName,
                courses: []
            };
        }
        acc[subjectName].courses.push(course);
        return acc;
    }, {} as {  });

    const uniqueSubjects: Subject[] = Object.values(subjects);

    uniqueSubjects.sort((a, b) => b.courses.length - a.courses.length);

    // Send the sorted result as the response
    res.status(200).send(uniqueSubjects);
}

export async function createCourse(req: Request, res: Response) {
    const options = CreateCourseScheme.parse(req.body);

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

    res.status(200).send(course);
}

export async function updateCourse(req: Request, res: Response) {
    const { courseResolvable } = req.params;
    const options = UpdateCourseScheme.parse(req.body);

    // PurdueIO confirms existence of course and standardizes name and subject fields
    const purdueIoSubject = await PurdueIoAPI.getSubject(options.abbreviation);
    const purdueIoCourse = await PurdueIoAPI.getCourse(purdueIoSubject, options.number);

    const course = await prisma.course.update({
        where: Resolver.course(courseResolvable),
        data: {
            ...options,
            name: purdueIoCourse.Title,
            subject: purdueIoSubject.Name,
            flags: FlagEncoder.course(options.flags),
        }
    });

    res.status(200).send(course);
}

export async function toggleCoursePublished(req: Request, res: Response) {
    const { courseResolvable } = req.params;

    const course = await prisma.course.findUnique({
        where: Resolver.course(courseResolvable),
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
    const { courseResolvable } = req.params;

    const course = await prisma.course.delete({
        where: Resolver.course(courseResolvable)
    });

    if (!course) {
        throw new NotFoundError("Course not found");
    }

    res.status(200).send(course);
}