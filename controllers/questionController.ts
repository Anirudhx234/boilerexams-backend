import prisma from "../libs/prisma.js";
import { Request, Response } from 'express';
import { APIError, NotFoundError } from "../middleware/errors/index.js";
import msToDate from "../utils/msToDate.js";
import answerChoiceStats from "../helpers/stats/answerChoiceStats.js";

const getQuestion = async (req: Request, res: Response) => {
    const { questionId } = req.params;
    const question = await prisma.question.findFirst({
        where: {
            id: questionId
        },
        include: {
            topics: true,
            exam: {
                include: {
                    semester: true,
                }
            },
            course: true,
            answerChoices: {
                orderBy: {
                    choiceIndex: 'asc'
                },
                include: {
                    resources: {
                        include: {
                            image: true,
                            code: true
                        }
                    }
                }
            },
            resources: {
                include: {
                    image: true,
                    code: true
                }
            },
            submissions: true
        }
    });
    if (!question) {
        throw new NotFoundError("Question not found");
    }

    // @ts-expect-error Extend Later
    question.answerChoiceStats = await answerChoiceStats(questionId);

    res.status(200).send(question);
};

const createQuestion = async (req: Request, res: Response) => {
    const { courseId, examId } = req.params;
    const { topics, number, body, answerChoices, correctChoiceIndices, solutionVideoLink, explanationText, resourceIds, disableRandomAnswers } = req.body;

    await prisma.course.update({
        where: {
            id: courseId
        },
        data: {
            topics: {
                connectOrCreate: topics.map((topic) => ({
                    where: { name: topic }, create: { name: topic }
                }))
            }
        }
    });

    const question = await prisma.question.create({
        data: {
            courseId: courseId,
            examId: examId,
            topics: {
                connect: topics.map((topic) => ({ name: topic }))
            },
            number: Number(number),
            body: body,
            answerChoices: {
                create: answerChoices.map((answerChoice) => ({
                    choiceIndex: Number(answerChoice.choiceIndex),
                    body: answerChoice.body,
                    resources: {
                        connect: answerChoice.resourceIds.map((resourceId) => ({ id: resourceId }))
                    }
                }))
            },
            correctChoiceIndices: correctChoiceIndices,
            solutionVideoLink: solutionVideoLink,
            explanationText: explanationText,
            resources: {
                connect: resourceIds.map((resourceId) => ({ id: resourceId }))
            },
            disableRandomAnswers: disableRandomAnswers
        },
        include: {
            topics: true,
            answerChoices: {
                orderBy: {
                    choiceIndex: 'asc'
                },
                include: {
                    resources: {
                        include: {
                            image: true,
                            code: true
                        }
                    }
                }
            },
            resources: {
                include: {
                    image: true,
                    code: true
                }
            }
        }
    });
    res.status(200).send(question);
};

const updateQuestion = async (req: Request, res: Response) => {
    const { courseId, examId, questionId } = req.params;
    const {
        topics,
        number,
        body,
        answerChoices,
        correctChoiceIndices,
        solutionVideoLink,
        explanationText,
        resources,
        resourceIds,
    } = req.body;

    await prisma.course.update({
        where: {
            id: courseId,
        },
        data: {
            topics: {
                connectOrCreate: topics.map((topic) => ({
                    where: { name: topic },
                    create: { name: topic },
                })),
            },
        },
    });

    const existingAnswerChoices = answerChoices.filter((answerChoice) => {
        return answerChoice.id !== undefined;
    });

    const question = await prisma.question.update({
        where: {
            id: questionId,
        },
        data: {
            courseId: courseId,
            examId: examId,
            topics: {
                set: topics.map((topic: string) => ({ name: topic })),
            },
            number: Number(number),
            body: body,
            answerChoices: {
                deleteMany: {
                    id: {
                        notIn: existingAnswerChoices.map((answerChoice) => answerChoice.id),
                    },
                },
                upsert: answerChoices.map((answerChoice) => ({
                    where: {
                        id: answerChoice.id || "",
                    },
                    update: {
                        choiceIndex: Number(answerChoice.choiceIndex),
                        body: answerChoice.body,
                        resources: {
                            deleteMany: {
                                id: {
                                    notIn: answerChoice.resourceIds,
                                },
                            },
                            connect: answerChoice.resourceIds.map((resourceId) => ({
                                id: resourceId,
                            })),
                        },
                    },
                    create: {
                        choiceIndex: Number(answerChoice.choiceIndex),
                        body: answerChoice.body,
                        resources: {
                            connect: answerChoice.resourceIds.map((resourceId) => ({
                                id: resourceId,
                            })),
                        },
                    },
                })),
            },
            correctChoiceIndices: correctChoiceIndices,
            solutionVideoLink: solutionVideoLink,
            explanationText: explanationText,
            resources: {
                deleteMany: {
                    id: {
                        notIn: resourceIds,
                    },
                },
                // connect: resourceIds.map((resourceId) => ({ id: resourceId }))
                upsert: resources.map((resource) => ({
                    where: {
                        id: resource.id ?? "",
                    },
                    update: resource,
                    create: resource,
                })),
            },
        },
        include: {
            topics: true,
            answerChoices: {
                orderBy: {
                    choiceIndex: "asc",
                },
                include: {
                    resources: {
                        include: {
                            image: true,
                            code: true,
                        },
                    },
                },
            },
            resources: {
                include: {
                    image: true,
                    code: true,
                },
            },
        },
    });
    res.status(200).send(question);
};

const toggleQuestionPublished = async (req: Request, res: Response) => {
    const { questionId } = req.params;
    const question = await prisma.question.findUnique({
        where: {
            id: questionId
        },
        select: {
            exam: {
                select: {
                    published: true
                }
            },
            published: true
        }
    });
    if (!question) {
        throw new NotFoundError("Question not found");
    }
    if (!question.exam.published) {
        throw new APIError("Exam must be published", 409);
    }

    const published = !question.published;
    await prisma.question.update({
        where: {
            id: questionId
        },
        data: {
            published: published
        }
    });
    res.status(200).send({ message: `Question is now ${published ? "published" : "unpublished"}` });
};

const deleteQuestion = async (req: Request, res: Response) => {
    const { questionId } = req.params;
    const question = await prisma.question.delete({
        where: {
            id: questionId
        }
    });

    if (!question) {
        throw new NotFoundError("Question not found");
    }
    res.status(200).send(question);
};

const createQuestionSubmission = async (req: Request, res: Response) => {
    const { questionId } = req.params;
    const { selectedChoiceIndices, correct,
        timeStarted, timeEnded, videoStartTime, videoEndTime,
        videoTotalWatchTime, modalStartTime, modalEndTime, modalTotalTime, osFamily } = req.body;

    if (selectedChoiceIndices.length === 0) {
        throw new APIError("Submission must contain selected choice(s)", 400);
    }

    const startTime = msToDate(timeStarted);
    const endTime = msToDate(timeEnded);
    const videoStart = msToDate(videoStartTime);
    const videoEnd = msToDate(videoEndTime);
    const modalStart = msToDate(modalStartTime);
    const modalEnd = msToDate(modalEndTime);


    const timeSpent = (endTime.valueOf() - startTime.valueOf());
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
            osFamily: osFamily
        }
    });
    res.status(200).send(submission);
};

const bulkQuestionSubmission = async (req: Request, res: Response) => {
    const rawSubmissions = req.body;

    const submissions = await prisma.$transaction(
        rawSubmissions.map(({ 
          questionId, selectedChoiceIndices, correct,
          timeStarted, timeEnded, videoStartTime, videoEndTime,
          videoTotalWatchTime, modalStartTime, modalEndTime, modalTotalTime, osFamily
        }) => {
            const startTime = msToDate(timeStarted);
            const endTime = msToDate(timeEnded);
            const videoStart = msToDate(videoStartTime);
            const videoEnd = msToDate(videoEndTime);
            const modalStart = msToDate(modalStartTime);
            const modalEnd = msToDate(modalEndTime);
            const timeSpent = (endTime.valueOf() - startTime.valueOf());
            
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
                    osFamily: osFamily
                }
            });
        })
    );

    res.status(200).send(submissions);
};

const updateSubmission = async (req: Request, res: Response) => {
    const { submissionId } = req.params;
    const { videoStartTime,
        videoEndTime, videoTotalWatchTime, modalStartTime,
        modalEndTime, modalTotalTime } = req.body;

    const videoStart = msToDate(videoStartTime);
    const videoEnd = msToDate(videoEndTime);
    const modalStart = msToDate(modalStartTime);
    const modalEnd = msToDate(modalEndTime);

    const submission = await prisma.submission.update({
        where: {
            id: submissionId
        },
        data: {
            videoStartTime: videoStart,
            videoEndTime: videoEnd,
            timeSpentVideo: videoTotalWatchTime,
            modalStartTime: modalStart,
            modalEndTime: modalEnd,
            modalTotalTime: modalTotalTime
        }
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
    updateSubmission
};