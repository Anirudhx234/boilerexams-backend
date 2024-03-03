import prisma from "../libs/prisma.js";
import { Request, Response } from "express";
import { APIError, NotFoundError } from "../middleware/errors/index.js";
import msToDate from "../utils/msToDate.js";
import answerChoiceStats from "../helpers/stats/single.answerChoiceStats.js";
import Resolver from "../helpers/resolver.js";
import { CreateQuestionScheme, MultipleChoiceQuestionData, UpdateQuestionScheme } from "../prisma/schema.js";

const getQuestion = async (req: Request, res: Response) => {
    const { courseResolvable, examResolvable, questionResolvable } = req.params;

    const question = await prisma.question.findFirst({
        where: await Resolver.question(questionResolvable, examResolvable, courseResolvable),
        include: {
            course: true,
            topics: true,
            exam: true,
            resources: true,
        },
    });

    if (!question) {
        throw new NotFoundError("Question not found");
    }

    res.status(200).send({
        ...question,
        answerChoiceStats: await answerChoiceStats(question.id)
    });
};

const createQuestion = async (req: Request, res: Response) => {
    const { courseResolvable, examResolvable } = req.params;

    const exam = await prisma.exam.findUnique({
        where: await Resolver.exam(examResolvable, courseResolvable)
    });

    if (!exam) {
        throw new APIError("Exam not found", 404);
    }

    const options = CreateQuestionScheme.parse(req.body);

    const question = await prisma.question.create({
        data: {
            ...options,
            examId: exam.id,
            courseId: exam.courseId,
            flags: 0
        }
    });

    res.status(200).send(question);
};

const updateQuestion = async (req: Request, res: Response) => {
    const { courseResolvable, examResolvable, questionResolvable } = req.params;
    const options = UpdateQuestionScheme.parse(req.body);

    // Need to hack since we can't force uniqueness on question numbers
    const question = await prisma.question.findFirst({
        where: await Resolver.question(questionResolvable, examResolvable, courseResolvable)
    });

    if (!question) throw new APIError(`Question not found: ${questionResolvable}`, 404);

    const topicOptions = options.topics.map(topic => {
        return {
            where: {
                id: topic.id
            },
            create: {
                ...topic,
                courseId: question.courseId
            }
        };
    });

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

    const updatedQuestion = await prisma.question.update({
        where: {
            id: question.id
        },
        data: {
            ...options,
            topics: {
                connectOrCreate: {
                    ...topicOptions
                },
                deleteMany: {
                    id: {
                        notIn: options.topics.map(topic => topic.id)
                    }
                }
            },
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
        },
        include: {
            topics: true,
            resources: true,
        }
    });

    res.status(200).send(updatedQuestion);
};

const toggleQuestionPublished = async (req: Request, res: Response) => {
    const { questionResolvable, examResolvable, courseResolvable } = req.params;

    // Need to hack since we can't force uniqueness on question numbers
    const question = await prisma.question.findFirst({
        where: await Resolver.question(questionResolvable, examResolvable, courseResolvable),
        select: {
            id: true,
            exam: {
                select: {
                    flags: true
                }
            },
            flags: true
        }
    });

    if (!question) {
        throw new NotFoundError("Question not found");
    }
    if ((question.exam.flags & 1) == 0) {
        throw new APIError("Exam must be published", 409);
    }

    const published = (question.flags & 1) == 0;

    await prisma.question.update({
        where: {
            id: question.id,
        },
        data: {
            flags: question.flags ^ 1
        },
    });

    res.status(200).send({
        message: `Question is now ${published ? "published" : "unpublished"}`,
    });
};



const deleteQuestion = async (req: Request, res: Response) => {
    const { questionResolvable, examResolvable, courseResolvable } = req.params;

    // More hacks because question number is not unique
    const question = await prisma.question.deleteMany({
        where: await Resolver.question(questionResolvable, examResolvable, courseResolvable),
    });

    if (!question) {
        throw new NotFoundError("Question not found");
    }

    res.status(200).send(question);
};


const createQuestionSubmission = async (req: Request, res: Response) => {
    const { questionId } = req.params;
    const {
        selectedChoiceIndices,
        correct,
        timeStarted,
        timeEnded,
        timeSpent,
        videoStartTime,
        videoEndTime,
        videoTotalWatchTime,
        modalStartTime,
        modalEndTime,
        modalTotalTime,
        osFamily,
    } = req.body;

    const startTime = msToDate(timeStarted);
    const endTime = msToDate(timeEnded);
    const videoStart = msToDate(videoStartTime);
    const videoEnd = msToDate(videoEndTime);
    const modalStart = msToDate(modalStartTime);
    const modalEnd = msToDate(modalEndTime);

    const submission = await prisma.submission.create({
        data: {
            questionId: questionId,
            correct: Boolean(correct),
            selectedChoiceIndices: selectedChoiceIndices,
            timeStarted: startTime,
            timeEnded: endTime,
            timeSpent: Math.floor(timeSpent),
            videoStartTime: videoStart,
            videoEndTime: videoEnd,
            timeSpentVideo: Math.floor(videoTotalWatchTime),
            modalStartTime: modalStart,
            modalEndTime: modalEnd,
            modalTotalTime: modalTotalTime,
            osFamily: osFamily,
        },
    });
    res.status(200).send(submission);
};

const bulkQuestionSubmission = async (req: Request, res: Response) => {
    const rawSubmissions = req.body;

    const submissions = await prisma.$transaction(
        rawSubmissions.map(
            ({
                 questionId,
                 selectedChoiceIndices,
                 correct,
                 timeStarted,
                 timeEnded,
                 timeSpent,
                 videoStartTime,
                 videoEndTime,
                 videoTotalWatchTime,
                 modalStartTime,
                 modalEndTime,
                 modalTotalTime,
                 osFamily,
             }) => {
                const startTime = msToDate(timeStarted);
                const endTime = msToDate(timeEnded);
                const videoStart = msToDate(videoStartTime);
                const videoEnd = msToDate(videoEndTime);
                const modalStart = msToDate(modalStartTime);
                const modalEnd = msToDate(modalEndTime);

                return prisma.submission.create({
                    data: {
                        questionId: questionId,
                        correct: Boolean(correct),
                        selectedChoiceIndices: selectedChoiceIndices,
                        timeStarted: startTime,
                        timeEnded: endTime,
                        timeSpent: Math.floor(timeSpent),
                        videoStartTime: videoStart,
                        videoEndTime: videoEnd,
                        timeSpentVideo: Math.floor(videoTotalWatchTime),
                        modalStartTime: modalStart,
                        modalEndTime: modalEnd,
                        modalTotalTime: modalTotalTime,
                        osFamily: osFamily,
                    },
                });
            },
        ),
    );

    res.status(200).send(submissions);
};

const updateSubmission = async (req: Request, res: Response) => {
    const { submissionId } = req.params;
    const { videoStartTime, videoEndTime, videoTotalWatchTime, modalStartTime, modalEndTime, modalTotalTime } = req.body;

    const videoStart = msToDate(videoStartTime);
    const videoEnd = msToDate(videoEndTime);
    const modalStart = msToDate(modalStartTime);
    const modalEnd = msToDate(modalEndTime);

    const submission = await prisma.submission.update({
        where: {
            id: submissionId,
        },
        data: {
            videoStartTime: videoStart,
            videoEndTime: videoEnd,
            timeSpentVideo: videoTotalWatchTime,
            modalStartTime: modalStart,
            modalEndTime: modalEnd,
            modalTotalTime: modalTotalTime,
        },
    });
    res.status(200).send(submission);
};



export {
    getQuestion,
    createQuestion,
    updateQuestion,
    toggleQuestionPublished,
    deleteQuestion,
    createQuestionSubmission,
    bulkQuestionSubmission,
    updateSubmission,
};
