import { APIError, CourseAlreadyExistsError, NotFoundError } from "../middleware/errors/index.js";
import { Request, Response } from "express";
import { DiscordAPI } from "../services/discord.api.js";
import { PurdueIoAPI } from "../services/purdue.io.js";
import prisma from "../libs/prisma.js";
import uploadFileToS3 from "../utils/uploadFileToS3.js";
import { FeedbackStatus, FeedbackType, ResourceType } from "@prisma/client";
import Resolver from "../helpers/resolver.js";
import {
    BugReportData,
    QuestionReportData,
    FeatureRequestData,
    VideoFeedbackData, CourseRequestScheme
} from "../prisma/schema.js";

export async function getAllVideoFeedback(req: Request, res: Response) {
    const videoFeedback = await prisma.feedback.findMany({
        where: {
            type: FeedbackType.VIDEO_FEEDBACK
        },
        include: {
            question: {
                include: {
                    exam: true
                }
            }
        }
    });

    res.status(200).send(videoFeedback);
}

export async function getAllCourseRequests(req: Request, res: Response) {
    const courseRequests = await prisma.courseRequest.findMany();
    res.status(200).send(courseRequests);
}

export async function getAllApplications(req: Request, res: Response) {
    const applications = await prisma.application.findMany({
        include: {
            resume: true
        }
    });

    res.status(200).send(applications);
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

export async function getVideoFeedbackByCourse(req: Request, res: Response) {
    const { courseResolvable } = req.params;

    const course = await prisma.course.findUnique({
        where: Resolver.course(courseResolvable),
        include: {
            feedback: {
                include: {
                    question: {
                        include: {
                            resources: true
                        }
                    }
                }
            }
        }
    });

    if (!course) throw new NotFoundError("Course Not Found");

    const feedback = course.feedback.filter(feedback => feedback.type == FeedbackType.VIDEO_FEEDBACK);

    res.status(200).send(feedback);
}

export async function getVideoFeedbackByExam(req: Request, res: Response) {
    const { examResolvable, courseResolvable } = req.params;

    const exam = await prisma.exam.findUnique({
        where: await Resolver.exam(examResolvable, courseResolvable),
        include: {
            course: true,
            feedback: {
                include: {
                    question: {
                        include: {
                            resources: true
                        }
                    }
                }
            }
        },
    });

    if (!exam) throw new NotFoundError("Exam Not Found");

    const feedback = exam.feedback.filter(feedback => feedback.type == FeedbackType.VIDEO_FEEDBACK);

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
    const options = CourseRequestScheme.parse(req.body);
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

    // ToDo figure out why this has wrong argument type
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
    const { questionResolvable, topicResolvable, examResolvable, courseResolvable } = req.params;
    const options = QuestionReportData.parse(req.body);

    const question = await prisma.question.findUnique({
        where: await Resolver.question(questionResolvable, topicResolvable, examResolvable, courseResolvable),
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

    if (!question) throw new NotFoundError("Question does not exist");

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
            questionId: question?.id,
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
    const { questionResolvable, topicResolvable, examResolvable, courseResolvable } = req.params;
    const options = VideoFeedbackData.parse(req.body);

    const question = await prisma.question.findUnique({
        where: await Resolver.question(questionResolvable, topicResolvable, examResolvable, courseResolvable),
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