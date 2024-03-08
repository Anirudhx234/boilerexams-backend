import prisma from "../libs/prisma.js";
import uploadFileToS3 from "../utils/uploadFileToS3.js";
import { Request, Response } from "express";
import { NotFoundError } from "../middleware/errors/index.js";
import { PurdueIoAPI } from "../services/purdue.io.js";
import {
    CreateCourseScheme,
    FileResourceData,
    UpdateCourseScheme
} from "../prisma/schema.js";
import Resolver from "../helpers/resolver.js";
import FlagEncoder from "../helpers/encoder.js";
import FlagDecoder from "../helpers/decoder.js";

// ToDo handle multiple graphic resource uploads that are file-based
export async function uploadGraphic(graphicLink?: string, file?: Express.Multer.File) {
    if (file) {
        const data = await uploadFileToS3(file.buffer, file.mimetype);
        return data.Location;
    }
    return graphicLink;
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
            resources: { },
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

    // Upload image resource images to S3
    for (const resource of options.resources) {
        const result = FileResourceData.safeParse(resource.data);
        if (result.success) {
            result.data.url = await uploadGraphic(result.data.url, req.file);
            resource.data = result.data;
        }
    }

    const resourceOptions = options.resources.map(resource => {
        return {
            where: {
                id: resource.id
            },
            create: {
                ...resource
            }
        };
    });

    const course = await prisma.course.update({
        where: Resolver.course(courseResolvable),
        data: {
            ...options,
            name: purdueIoCourse.Title,
            subject: purdueIoSubject.Name,
            flags: FlagEncoder.course(options.flags),
            resources: {
                connectOrCreate: {
                    ...resourceOptions
                },
                deleteMany: {
                    id: {
                        notIn: options.resources.map(resource => resource.id)
                    }
                }
            },
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
            // Flip the LSB on flags
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