import prisma from "../libs/prisma.js";
import uploadFileToS3 from "../utils/uploadFileToS3.js";
import { Request, Response } from "express";
import { NotFoundError } from "../middleware/errors/index.js";
import { PurdueIoAPI } from "../services/purdue.io.js";
import {
    CreateCourseScheme,
    UpdateCourseScheme,
} from "../prisma/schema.js";
import Resolver from "../helpers/resolver.js";

const uploadGraphic = async (graphicLink: string, file?: Express.Multer.File) => {
    if (file) {
        const data = await uploadFileToS3(file.buffer, file.mimetype);
        return data.Location;
    }
    return graphicLink;
};

const createCourse = async (req: Request, res: Response) => {
    const options = CreateCourseScheme.parse(req.body);

    // PurdueIO confirms existence of course and standardizes name and subject fields
    const purdueIoSubject = await PurdueIoAPI.getSubject(options.abbreviation);
    const purdueIoCourse = await PurdueIoAPI.getCourse(purdueIoSubject, options.number);

    if (options.graphic && !options.graphic.id) {
        // Upload graphic to S3
        options.graphic.data.url = await uploadGraphic(options.graphic.data.url, req.file);
    }

    const course = await prisma.course.create({
        data: {

            name: purdueIoCourse.Title,
            subject: purdueIoSubject.Name,
            ...options,

            // Connect an existing graphic or create a new graphic resource
            graphic: options.graphic ? {
                connectOrCreate: {
                    where: {
                        id: options.graphic?.id
                    },
                    create: {
                        ...options.graphic
                    }
                }
            } : undefined, // This handles no graphic

            flags: 0,
        },
        include: {
            exams: true,
            topics: true,
            questions: true,
        },
    });

    res.status(200).send(course);
};

const updateCourse = async (req: Request, res: Response) => {
    const { courseResolvable } = req.params;
    const options = UpdateCourseScheme.parse(req.body);

    // PurdueIO confirms existence of course and standardizes name and subject fields
    const purdueIoSubject = await PurdueIoAPI.getSubject(options.abbreviation);
    const purdueIoCourse = await PurdueIoAPI.getCourse(purdueIoSubject, options.number);

    if (options.graphic && !options.graphic.id) {
        // Upload graphic to S3
        await uploadGraphic(options.graphic.data.url, req.file);
    }

    const course = await prisma.course.update({
        where: Resolver.course(courseResolvable),
        data: {
            abbreviation: options.abbreviation,
            number: options.number,
            name: purdueIoCourse.Title,
            subject: purdueIoSubject.Name,
            color: options.color,
            disclaimer: options.disclaimer,

            // Connect an existing graphic or create a new graphic resource
            graphic: options.graphic ? {
                connectOrCreate: {
                    where: {
                        id: options.graphic?.id
                    },
                    create: {
                        ...options.graphic
                    }
                }
            } : undefined, // This handles no graphic

            modes: options.modes,
            flags: 0,
        }
    });

    res.status(200).send(course);
};

const toggleCoursePublished = async (req: Request, res: Response) => {
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

    await prisma.course.update({
        where: {
            id: course.id,
        },
        data: {
            // Flip the LSB on flags
            flags: course.flags ^ 1
        },
    });

    res.status(200).send({
        message: `${course.name} is now ${(((course.flags ^ 1) & 1) == 1) ? "published" : "unpublished"}`,
    });
};

const deleteCourse = async (req: Request, res: Response) => {
    const { courseResolvable } = req.params;

    const course = await prisma.course.delete({
        where: Resolver.course(courseResolvable)
    });

    if (!course) {
        throw new NotFoundError("Course not found");
    }

    res.status(200).send(course);
};

export { createCourse, updateCourse, toggleCoursePublished, deleteCourse };