import prisma from "../libs/prisma.js";
import { StudyMode } from "@prisma/client";
import { Request, Response } from 'express';
import { APIError, NotFoundError } from "../middleware/errors/index.js";
import { PurdueIoAPI } from "../services/purdue.io.js";
import uploadFileToS3 from "../utils/uploadFileToS3.js";
import hexModifier from "../utils/hexModifier.js";

const getCourseInfo = async (abbreviation: string, number: number) => {
    const stringifiedNumber = String(number);
    const courseNumber = stringifiedNumber + "0".repeat(5 - stringifiedNumber.length);
    const purdueIoSubject = await PurdueIoAPI.getSubject(abbreviation.toUpperCase());
    const purdueIoCourse = await PurdueIoAPI.getCourse(purdueIoSubject, courseNumber);
    return { courseNumber, purdueIoCourse, purdueIoSubject };
};

const getStudyModes = async (modes: string[]) => {
    try {
        for (let i = 0; i < modes.length; i++) {
            modes[i] = StudyMode[modes[i].toUpperCase() as keyof typeof StudyMode];
        }
    } catch (error) {
        throw new APIError("Invalid study modes", 400);
    }
};

const uploadGraphic = async (file, graphicLink: string) => {
    let graphic = "";
    if (file) {
        const data = await uploadFileToS3(file.buffer, file.mimetype);
        graphic = data.Location;
    }
    else {
        graphic = graphicLink;
    }
    return graphic;
};

const createCourse = async (req: Request, res: Response) => {
    const { abbreviation, number, backgroundColor, graphicLink, studyModes } = req.body;

    const secondaryColor = hexModifier(backgroundColor, 1.4);

    getStudyModes(studyModes);

    const { courseNumber, purdueIoCourse, purdueIoSubject } = await getCourseInfo(abbreviation, number);

    const graphic = await uploadGraphic(req.file, graphicLink);

    const course = await prisma.course.create({
        data: {
            name: purdueIoCourse.Title,
            subject: purdueIoSubject.Name,
            abbreviation: purdueIoSubject.Abbreviation,
            number: Number(courseNumber),
            backgroundColor: backgroundColor,
            secondaryColor: secondaryColor,
            graphicLink: graphic,
            studyModes: studyModes
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
    const { abbreviation, number, backgroundColor, graphicLink, studyModes } = req.body;

    const secondaryColor = hexModifier(backgroundColor, 1.4);

    getStudyModes(studyModes);

    const { courseNumber, purdueIoCourse, purdueIoSubject } = await getCourseInfo(abbreviation, number);

    const graphic = await uploadGraphic(req.file, graphicLink);

    const course = await prisma.course.update({
        where: {
            id: courseId
        },
        data: {
            name: purdueIoCourse.Title,
            subject: purdueIoSubject.Name,
            abbreviation: purdueIoSubject.Abbreviation,
            number: Number(courseNumber),
            backgroundColor: backgroundColor,
            secondaryColor: secondaryColor,
            graphicLink: graphic,
            studyModes: studyModes
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