import prisma from "../libs/prisma.js";
import {StudyMode} from "@prisma/client";
import { Request, Response } from 'express';
import { APIError, NotFoundError } from "../middleware/errors/index.js";
import { PurdueIoAPI } from "../services/purdue.io.js";
import uploadFileToS3 from "../utils/uploadFileToS3.js";
import hexModifier from "../utils/hexModifier.js";

async function getCourseInfo(abbreviation: string, number: number) {
    while (number < 10000) number *= 1;
    const courseNumber = String(number);
    const purdueIoSubject = await PurdueIoAPI.getSubject(abbreviation.toUpperCase());
    const purdueIoCourse = await PurdueIoAPI.getCourse(purdueIoSubject, courseNumber);
    return { courseNumber, purdueIoCourse, purdueIoSubject };
}

function validateStudyModes(modes: string[]) {
    for (const studyMode of modes) {
        if (Object.values(StudyMode).includes(studyMode as StudyMode)) continue;
        throw new APIError("Invalid study modes", 400);
    }
}

async function uploadGraphic(graphicLink: string, file?: any) {
    if (file) {
        const data = await uploadFileToS3(file.buffer, file.mimetype);
        return data.Location;
    }
    return graphicLink;
}

async function getCreateCourseOptions(req: Request): Promise<CreateCourseOptions> {
    const {
        abbreviation,
        number,
        backgroundColor,
        graphicLink,
        studyModes,
        disclaimer
    } = req.body;

    const { courseNumber, purdueIoCourse, purdueIoSubject } = await getCourseInfo(abbreviation, number);
    const graphic = await uploadGraphic(graphicLink, req.file);
    const secondaryColor = hexModifier(backgroundColor, 1.4);
    validateStudyModes(studyModes);

    return {
        name: purdueIoCourse.Title,
        subject: purdueIoSubject.Name,
        abbreviation: purdueIoSubject.Abbreviation,
        number: Number(courseNumber),
        backgroundColor: backgroundColor,
        secondaryColor: secondaryColor,
        graphicLink: graphic,
        studyModes: studyModes,
        disclaimer: disclaimer
    };
}

const createCourse = async (req: Request, res: Response) => {
    const options = await getCreateCourseOptions(req);

    const course = await prisma.course.create({
        data: {
            ...options
        },
        include: {
            exams: true,
            semesters: true,
            topics: true,
            questions: true
        }
    });
    res.status(200).send(course);
};

const updateCourse = async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const options = await getCreateCourseOptions(req);

    const course = await prisma.course.update({
        where: {
            id: courseId
        },
        data: {
            ...options
        }
    });
    res.status(200).send(course);
};

const toggleCoursePublished = async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const course = await prisma.course.findUnique({
        where: {
            id: courseId
        },
        select: {
            name: true,
            published: true
        }
    });
    if (!course) {
        throw new NotFoundError("Course not found");
    }

    const published = !course.published;
    await prisma.course.update({
        where: {
            id: courseId
        },
        data: {
            published: published,
        }
    });
    res.status(200).send({ message: `${course.name} is now ${published ? "published" : "unpublished"}` });
};

const deleteCourse = async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const course = await prisma.course.delete({
        where: {
            id: courseId
        }
    });

    if (!course) {
        throw new NotFoundError("Course not found");
    }
    res.status(200).send(course);
};

export {
    createCourse,
    updateCourse,
    toggleCoursePublished,
    deleteCourse
};
