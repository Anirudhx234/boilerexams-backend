var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PrismaClient } from "@prisma/client";
import { NotFoundError } from "../middleware/errors/index.js";
import { PurdueIoAPI } from "../services/purdue.io.js";
import uploadFileToS3 from "../utils/uploadFileToS3.js";
import hexModifier from "../utils/hexModifier.js";
const prisma = new PrismaClient();
const createCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { abbreviation, number, backgroundColor, graphicLink, published } = req.body;
    let graphic;
    if (req.file) {
        const data = yield uploadFileToS3(req.file.buffer, req.file.mimetype);
        graphic = data.Location;
    }
    else {
        graphic = graphicLink;
    }
    const secondaryColor = hexModifier(backgroundColor, 1.4);
    const stringifiedNumber = String(number);
    const courseNumber = stringifiedNumber + "0".repeat(5 - stringifiedNumber.length);
    const purdueIoSubject = yield PurdueIoAPI.getSubject(abbreviation.toUpperCase());
    const purdueIoCourse = yield PurdueIoAPI.getCourse(purdueIoSubject, courseNumber);
    const course = yield prisma.course.create({
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
    });
    res.status(200).send(course);
});
const updateCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const { abbreviation, number, backgroundColor, graphicLink } = req.body;
    let graphic;
    if (req.file) {
        const data = yield uploadFileToS3(req.file.buffer, req.file.mimetype);
        graphic = data.Location;
    }
    else {
        graphic = graphicLink;
    }
    const secondaryColor = hexModifier(backgroundColor, 1.4);
    const stringifiedNumber = String(number);
    const courseNumber = stringifiedNumber + "0".repeat(5 - stringifiedNumber.length);
    const purdueIoSubject = yield PurdueIoAPI.getSubject(abbreviation.toUpperCase());
    const purdueIoCourse = yield PurdueIoAPI.getCourse(purdueIoSubject, courseNumber);
    const course = yield prisma.course.update({
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
    });
    res.status(200).send(course);
});
const toggleCoursePublished = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const course = yield prisma.course.findUnique({
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
    yield prisma.course.update({
        where: {
            id: courseId
        },
        data: {
            published: published,
        }
    });
    res.status(200).send({ message: `${course.name} is now ${published ? "published" : "unpublished"}` });
});
const deleteCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const course = yield prisma.course.delete({
        where: {
            id: courseId
        }
    });
    if (!course) {
        throw new NotFoundError("Course not found");
    }
    res.status(200).send(course);
});
export { createCourse, updateCourse, toggleCoursePublished, deleteCourse };
//# sourceMappingURL=courseController.js.map