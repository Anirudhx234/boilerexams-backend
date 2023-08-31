var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import prisma from "../libs/prisma.js";
import { APIError, NotFoundError } from "../middleware/errors/index.js";
import msToDate from "../utils/msToDate.js";
import answerChoiceStats from "../helpers/stats/answerChoiceStats.js";
const getQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { questionId } = req.params;
    const question = yield prisma.question.findFirst({
        where: {
            id: questionId,
            published: true
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
    if (!question) {
        throw new NotFoundError("Question not found");
    }
    // @ts-ignore
    // Extend later
    question.answerChoiceStats = yield answerChoiceStats(questionId);
    res.status(200).send(question);
});
const createQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId, examId } = req.params;
    const { topics, number, body, answerChoices, correctChoiceIndices, solutionVideoLink, resourceIds } = req.body;
    yield prisma.course.update({
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
    const question = yield prisma.question.create({
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
            resources: {
                connect: resourceIds.map((resourceId) => ({ id: resourceId }))
            }
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
});
const updateQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId, examId, questionId } = req.params;
    const { topics, number, body, answerChoices, correctChoiceIndices, solutionVideoLink, resourceIds } = req.body;
    yield prisma.course.update({
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
    const existingAnswerChoices = answerChoices.filter((answerChoice) => {
        return answerChoice.id !== undefined;
    });
    const question = yield prisma.question.update({
        where: {
            id: questionId
        },
        data: {
            courseId: courseId,
            examId: examId,
            topics: {
                set: topics.map((topic) => ({ name: topic }))
            },
            number: Number(number),
            body: body,
            answerChoices: {
                deleteMany: {
                    id: {
                        notIn: existingAnswerChoices.map((answerChoice) => answerChoice.id)
                    }
                },
                upsert: answerChoices.map((answerChoice) => ({
                    where: {
                        id: answerChoice.id || ""
                    },
                    update: {
                        choiceIndex: Number(answerChoice.choiceIndex),
                        body: answerChoice.body,
                        resources: {
                            deleteMany: {
                                id: {
                                    notIn: answerChoice.resourceIds
                                }
                            },
                            connect: answerChoice.resourceIds.map((resourceId) => ({ id: resourceId }))
                        }
                    },
                    create: {
                        choiceIndex: Number(answerChoice.choiceIndex),
                        body: answerChoice.body,
                        resources: {
                            connect: answerChoice.resourceIds.map((resourceId) => ({ id: resourceId }))
                        }
                    }
                }))
            },
            correctChoiceIndices: correctChoiceIndices,
            solutionVideoLink: solutionVideoLink,
            resources: {
                deleteMany: {
                    id: {
                        notIn: resourceIds
                    }
                },
                connect: resourceIds.map((resourceId) => ({ id: resourceId }))
            }
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
});
const toggleQuestionPublished = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { questionId } = req.params;
    const question = yield prisma.question.findUnique({
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
    yield prisma.question.update({
        where: {
            id: questionId
        },
        data: {
            published: published
        }
    });
    res.status(200).send({ message: `Question is now ${published ? "published" : "unpublished"}` });
});
const deleteQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { questionId } = req.params;
    const question = yield prisma.question.delete({
        where: {
            id: questionId
        }
    });
    if (!question) {
        throw new NotFoundError("Question not found");
    }
    res.status(200).send(question);
});
const createQuestionSubmission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { questionId } = req.params;
    const { selectedChoiceIndices, correct, timeStarted, timeEnded, videoStartTime, videoEndTime, videoTotalWatchTime, modalStartTime, modalEndTime, modalTotalTime, osFamily } = req.body;
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
    const submission = yield prisma.submission.create({
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
});
const updateSubmission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { submissionId } = req.params;
    const { videoStartTime, videoEndTime, videoTotalWatchTime, modalStartTime, modalEndTime, modalTotalTime } = req.body;
    const videoStart = msToDate(videoStartTime);
    const videoEnd = msToDate(videoEndTime);
    const modalStart = msToDate(modalStartTime);
    const modalEnd = msToDate(modalEndTime);
    const submission = yield prisma.submission.update({
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
});
export { getQuestion, createQuestion, updateQuestion, toggleQuestionPublished, deleteQuestion, createQuestionSubmission, updateSubmission };
//# sourceMappingURL=questionController.js.map