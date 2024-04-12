import { APIError, CourseAlreadyExistsError, NotFoundError } from "../middleware/errors/index.js";
import { FeedbackStatus, FeedbackType, ResourceType } from "@prisma/client";
import { Request, Response } from "express";
import { DiscordAPI } from "../services/discord.api.js";
import { PurdueIoAPI } from "../services/purdue.io.js";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import prisma from "../prisma/prisma.js";
import Resolver from "../helpers/resolver.js";
import uploadFileToS3 from "../utils/uploadFileToS3.js";

export const FeatureRequestData = z.object({
    title:      z.string(),
    content:    z.string().max(2000),
    contact:    z.string().max(50).optional(),
});

export const QuestionReportData = FeatureRequestData.extend({
    userAgent:  z.string().optional(),
});

export const BugReportData = QuestionReportData.extend({
    location:   z.string(),
});

export const VideoFeedbackData = z.object({
    explanationQuality: z.number().min(1).max(5),
    productionQuality:  z.number().min(1).max(5),
    recommended:        z.boolean(),
    content:            z.string().optional()
});

export const FeedbackOptions = z.object({
    id:         z.string().uuid().default(randomUUID),
    type:       z.nativeEnum(FeedbackType),
    status:     z.nativeEnum(FeedbackStatus).default(FeedbackStatus.OPEN),
    data:       z.object({}),
    userId:     z.string().uuid().optional(),
    questionId: z.string().uuid().optional(),
});

export const CourseRequestOptions = FeedbackOptions.extend({
    abbreviation:   z.string().toUpperCase(),
    number:         z.number().min(100).max(99999)
});

export async function getCourseRequests(req: Request, res: Response) {
    const courseRequests = await prisma.courseRequest.findMany();
    res.status(200).send(courseRequests);
}

export async function getFeedback(req: Request, res: Response) {
    const { feedbackId } = req.params;

    const feedback = await prisma.feedback.findUniqueOrThrow({
        where: {
            id: feedbackId
        },
        include: {
            user: true,
            question: {
                include: {
                    course: {
                        include: {
                            users: true // Need users on course for Question Reports
                        }
                    }
                }
            }
        }
    });

    res.status(200).send(feedback);
}

export async function getVideoFeedback(req: Request, res: Response) {
    const { q, t, e, c } = req.params;

    const question = q ? await prisma.question.findFirstOrThrow({
        where: await Resolver.question(q, t, e, c)
    }) : undefined;

    const exam = e ? await prisma.exam.findUniqueOrThrow({
        where: await Resolver.exam(e, c)
    }) : undefined;

    const course = c ? await prisma.course.findUniqueOrThrow({
        where: Resolver.course(c)
    }): undefined;

    const feedback = await prisma.feedback.findMany({
        where: {
            questionId: question?.id,
            examId:     exam?.id,
            courseId:   course?.id
        }
    });

    res.status(200).send(feedback);
}

export async function createApplication(req: Request, res: Response) {
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
            year: year,
            resume: {
                create: {
                    type: ResourceType.PDF,
                    data: {
                        key: pdfData.Key,
                        url: pdfData.Location,
                    }
                }
            }
        },
    });

    await DiscordAPI.createApplication(application);
    res.status(200).send(application);
}

export async function requestCourse(req: Request, res: Response) {
    const options = CourseRequestOptions.parse(req.body);
    options.number = options.number < 100 ? options.number * 100 : options.number;

    const existingCourse = await prisma.course.findUnique({
        where: {
            abbreviation_number: {
                abbreviation: options.abbreviation,
                number: options.number,
            }
        },
    });

    if (existingCourse) throw new CourseAlreadyExistsError(`Existing Course Requested`);

    const subject = await PurdueIoAPI.getSubject(options.abbreviation);
    const course = await PurdueIoAPI.getCourse(subject, options.number);

    const courseRequest = await prisma.courseRequest.upsert({
        where: {
            id: course.Id,
        },
        create: {
            id: course.Id,
            name: course.Title,
            subject: subject.Name,
            abbreviation: subject.Abbreviation,
            number: Number(course.Number),
        },
        update: {
            count: {
                increment: 1, // Increment Request Count if CourseRequest exists
            },
        },
    });

    const courseRequests = await prisma.courseRequest.findMany({});
    await DiscordAPI.updateCourseRequests(courseRequests);
    res.status(200).send(courseRequest);
}

export async function reportBug(req: Request, res: Response) {
    const options = BugReportData.parse(req.body);
    const user = req.user;

    const report = await prisma.feedback.create({
        data: {
            type: FeedbackType.BUG_REPORT,
            userId: user.id,
            data: {
                ...options
            },
        },
        include: {
            user: true,
        },
    });

    await DiscordAPI.createFeedback(report);
    res.status(200).send("Success");
}

export async function reportQuestion(req: Request, res: Response) {
    const { q, t, e, c } = req.params;
    const options = QuestionReportData.parse(req.body);

    const question = await prisma.question.findFirstOrThrow({
        where: await Resolver.question(q, t, e, c),
        include: {
            course: {
                select: {
                    abbreviation: true,
                    number: true,
                    users: true,
                },
            },
            exam: {
                select: {
                    season: true,
                    year: true,
                    number: true,
                },
            },
        },
    });

    const course = question.course;
    const exam = question.exam;
    const title = `${course.abbreviation}${course.number} | `
        .concat(`${exam.season} ${exam.year} | `)
        .concat(`Exam ${exam.number} | `)
        .concat(`Question ${question.number}`)
        .replace("Exam 0", "Final Exam");

    const report = await prisma.feedback.create({
        data: {
            type: FeedbackType.QUESTION_REPORT,
            status: FeedbackStatus.OPEN,
            userId: req.user?.id,
            questionId: question.id,
            examId: question.examId,
            courseId: question.courseId,
            data: {
                ...options,
                title: title
            }
        },
        include: {
            question: true,
            user: true,
        },
    });

    await DiscordAPI.createFeedback(report);
    res.status(200).send(report);
}

export async function requestFeature(req: Request, res: Response) {
    const options = FeatureRequestData.parse(req.body);

    const request = await prisma.feedback.create({
        data: {
            type: FeedbackType.FEATURE_REQUEST,
            userId: req.user?.id,
            data: {
                ...options
            }
        }
    });

    await DiscordAPI.createFeedback(request);
    res.status(200).send(request);
}

export async function createVideoFeedback(req: Request, res: Response) {
    const { q, t, e, c } = req.params;
    const options = VideoFeedbackData.parse(req.body);

    const question = await prisma.question.findFirstOrThrow({
        where: await Resolver.question(q, t, e, c),
        select: {
            id: true,
            examId: true,
            courseId: true
        }
    });

    if (!question) throw new NotFoundError("Question does not exist");

    const videoFeedback = await prisma.feedback.create({
        data: {
            type: FeedbackType.VIDEO_FEEDBACK,
            userId: req.user?.id,
            courseId: question.courseId,
            examId: question.examId,
            questionId: question.id,
            data: {
                ...options
            }
        }
    });

    res.status(200).send(videoFeedback);
}

export async function updateFeedbackStatus(req: Request, res: Response) {
    const { feedbackId } = req.params;
    const { status } = req.body;

    const feedback = await prisma.feedback.update({
        where: {
            id: feedbackId,
        },
        data: {
            status: status
        }
    });

    res.status(200).send(feedback);
}

export async function deleteFeedback(req: Request, res: Response) {
    const { feedbackId } = req.params;

    const videoFeedback = await prisma.feedback.delete({
        where: {
            id: feedbackId,
        },
    });

    res.status(200).send(videoFeedback);
}