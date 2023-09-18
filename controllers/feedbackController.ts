import { APIError, CourseAlreadyExistsError, NotFoundError } from "../middleware/errors/index.js";
import {ReportType, Year} from "@prisma/client";
import {Request, Response} from "express";
import {DiscordAPI} from "../services/discord.api.js";
import {PurdueIoAPI} from "../services/purdue.io.js";
import prisma from "../libs/prisma.js";
import uploadFileToS3 from "../utils/uploadFileToS3.js";

const getReport = async(req: Request, res: Response) => {
    const reportId = req.params.reportId;

    const report = await prisma.report.findUnique({
        where: {
            id: reportId
        }
    });

    if (!report) throw new NotFoundError("Report Not Found");

    res.status(200).send(report);
}

const createApplication = async (req: Request, res: Response) => {
    const { name, email, year, why } = req.body;
    const file = req.file;

    if (!file) {
        throw new APIError("No file attached", 400);
    }

    const pdfData = await uploadFileToS3(file.buffer, file.mimetype);

    const application = await prisma.application.create({
        data: {
            name: name,
            email: email,
            content: why,
            year: year.toUpperCase() as Year,
            pdfKey: pdfData.Key,
            pdfLink: pdfData.Location
        }
    });

    await DiscordAPI.createApplication(application);
    res.status(200).send(application);
}

const createCourseRequest = async (req: Request, res: Response) => {

    const { abbreviation, number } = req.body;

    const stringifiedNumber = String(number);
    const courseNumber = stringifiedNumber + "0".repeat(5 - stringifiedNumber.length);
    const purdueIoSubject = await PurdueIoAPI.getSubject(abbreviation.toUpperCase());
    const purdueIoCourse = await PurdueIoAPI.getCourse(purdueIoSubject, courseNumber);

    const existingCourse = await prisma.course.findFirst({
        where: {
            AND: [
                { abbreviation: purdueIoSubject.Abbreviation },
                { number: Number(purdueIoCourse.Number) }
            ]
        }
    });

    if (existingCourse) throw new CourseAlreadyExistsError(`Existing Course Requested`);

    const courseRequest = await prisma.courseRequest.upsert({
        where: {
            id: purdueIoCourse.Id
        },
        create: {
            id: purdueIoCourse.Id,
            name: purdueIoCourse.Title,
            subject: purdueIoSubject.Name,
            abbreviation: purdueIoSubject.Abbreviation,
            number: Number(purdueIoCourse.Number),
        },
        update: {
            requests: {
                increment: 1    // Increment Request Count if CourseRequest exists
            }
        }
    });

    const courseRequests = await prisma.courseRequest.findMany({  });
    await DiscordAPI.updateCourseRequests(courseRequests);
    res.status(200).send(courseRequest);
};

const createBugReport = async (req: Request, res: Response) => {
    const { title, description, footer, location } = req.body
    const user = req.user;

    try {
        const report = await prisma.report.create({
            data: {
                type: ReportType.BUG_REPORT,
                title: title,
                status: "in-progress",
                content: description,
                location: location,
                userAgent: footer,
                userId: user?.id
            },
            include: {
                user: true
            }
        });

        await DiscordAPI.createReport(report);
    } catch(error) {
        console.log(error);
    }

    res.status(200).send("Success");
}

const createQuestionBugReport = async (req: Request, res: Response) => {
    const { questionId } = req.params;
    const { referer, description, footer } = req.body;

    const question = await prisma.question.findUnique({
        where: {
            id: questionId
        },
        include: {
            course: {
                select: {
                    abbreviation: true,
                    number: true,
                    users: true,
                }
            },
            exam: {
                select: {
                    number: true,
                    semester: true
                }
            }
        }
    });

    if (!question) throw new NotFoundError("Question does not exist");

    const user = req.user;
    const course = question.course;
    const exam = question.exam;
    const semester = exam.semester;
    const title = `${course.abbreviation}${course.number} | ${semester.season} ${semester.year} | Exam ${exam.number} | Question ${question.number}`.replace("Exam 0", "Final Exam")

    const report = await prisma.report.create({
        data: {
            type: ReportType.CONTENT_REPORT,
            title: title,
            status: "in-progress",
            content: description,
            url: referer,
            userAgent: footer,
            questionId: question.id,
            userId: user.id
        },
        include: {
            question: {
                include: {
                    course: {
                        select: {
                            users: true,
                        }
                    },
                }
            },
            user: true
        }
    });

    await DiscordAPI.createReport(report);
    res.status(200).send(report);
}

const createFeatureRequest = async (req: Request, res: Response) => {
    const { title, description } = req.body;
    const user = req.user;

    const report = await prisma.report.create({
        data: {
            type: ReportType.FEATURE_REQUEST,
            title: title,
            content: description,
            status: "in-progress",
            userId: user.id
        },
        include: {
            user: true
        }
    });

    await DiscordAPI.createReport(report);
    res.status(200).send(report);
}

const createFeedbackReport = async (req: Request, res: Response) => {
    const { questionId } = req.params;
    const { explanationQuality, productionQuality, videoRecommendation, additionalFeedback} = req.body;

    const question = await prisma.question.findUnique({
        where: {
            id: questionId
        },
        include: {
            course: {
                select: {
                    abbreviation: true,
                    number: true,
                    users: true,
                }
            },
            exam: {
                select: {
                    number: true,
                    semester: true
                }
            }
        }
    });

    if (!question) throw new NotFoundError("Question does not exist");

    const feedback = await prisma.videoFeedback.create({
        data: {
            explanationQuality: explanationQuality,
            productionQuality: productionQuality,
            videoRecommendation: videoRecommendation,
            additionalFeedback: additionalFeedback,
            questionId: question.id
        },
        include: {
            question: true
        }
    });

    res.status(200).send(feedback);
}

const createReport = async (req: Request, res: Response) => {
    const report = await prisma.report.create({
        data: req.body
    });
    res.status(200).send(report);
}

const updateReport = async (req: Request, res: Response) => {
    const reportId = req.params.reportId;

    const report = await prisma.report.update({
        where: {
            id: reportId
        },
        data: req.body
    });

    res.status(200).send(report);
}

export {
    createApplication,
    createCourseRequest,
    createBugReport,
    createQuestionBugReport,
    createFeatureRequest,
    createFeedbackReport,
    createReport,
    getReport,
    updateReport
};