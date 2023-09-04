import prisma from "../libs/prisma.js";
import { Request, Response } from 'express'
import { NotFoundError } from "../middleware/errors/index.js";
import { PurdueIoAPI } from "../services/purdue.io.js";
import uploadFileToS3 from "../utils/uploadFileToS3.js";
import hexModifier from "../utils/hexModifier.js";

const createCourse = async (req: Request, res: Response) => {
    const { abbreviation, number, backgroundColor, graphicLink, published } = req.body

    let graphic: string;
    if (req.file) {
        const data = await uploadFileToS3(req.file.buffer, req.file.mimetype);
        graphic = data.Location
    }
    else {
        graphic = graphicLink
    }

    const secondaryColor = hexModifier(backgroundColor, 1.4);

    const stringifiedNumber = String(number);
    const courseNumber = stringifiedNumber + "0".repeat(5 - stringifiedNumber.length);
    const purdueIoSubject = await PurdueIoAPI.getSubject(abbreviation.toUpperCase());
    const purdueIoCourse = await PurdueIoAPI.getCourse(purdueIoSubject, courseNumber);

    const course = await prisma.course.create({
        data: {
            name: purdueIoCourse.Title,
            subject: purdueIoSubject.Name,
            abbreviation: purdueIoSubject.Abbreviation,
            number: Number(courseNumber),
            backgroundColor: backgroundColor,
            secondaryColor: secondaryColor,
            graphicLink: graphic,
            published: published
        },
        include: {
            exams: true,
            semesters: true,
            topics: true,
            questions: true
        }
    })
    res.status(200).send(course)
}

const updateCourse = async (req: Request, res: Response) => {
    const { courseId } = req.params
    const { abbreviation, number, backgroundColor, graphicLink } = req.body;

    let graphic: string;
    if (req.file) {
        const data = await uploadFileToS3(req.file.buffer, req.file.mimetype);
        graphic = data.Location
    }
    else {
        graphic = graphicLink
    }

    const secondaryColor = hexModifier(backgroundColor, 1.4);

    const stringifiedNumber = String(number);
    const courseNumber = stringifiedNumber + "0".repeat(5 - stringifiedNumber.length);
    const purdueIoSubject = await PurdueIoAPI.getSubject(abbreviation.toUpperCase());
    const purdueIoCourse = await PurdueIoAPI.getCourse(purdueIoSubject, courseNumber);

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
        }
    })
    res.status(200).send(course)
}

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
    })
    if (!course) {
        throw new NotFoundError("Course not found")
    }

    const published = !course.published
    await prisma.course.update({
        where: {
            id: courseId
        },
        data: {
            published: published,
        }
    })
    res.status(200).send({ message: `${course.name} is now ${published ? "published" : "unpublished"}` })
}

const deleteCourse = async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const course = await prisma.course.delete({
        where: {
            id: courseId
        }
    })

    if (!course) {
        throw new NotFoundError("Course not found")
    }
    res.status(200).send(course)
}

export {
    createCourse,
    updateCourse,
    toggleCoursePublished,
    deleteCourse
}