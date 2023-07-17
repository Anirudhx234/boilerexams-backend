const { PrismaClient } = require('@prisma/client');
import { NotFoundError } from "../middleware/errors"
import { default as validDate} from "../utils/validDate"
const prisma = new PrismaClient();

const getQuestion = async (req, res) => {
    const { questionId } = req.params
    const question = await prisma.question.findFirst({
        where: {
            id: questionId,
            OR: req.published
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
    })

    if (!question) {
        throw new NotFoundError("Question not found");
    }
    res.status(200).send(question)
}

const createQuestion = async (req, res) => {
    const { courseId, examId } = req.params
    const { topics, number, body, answerChoices, correctChoiceIndices, solutionVideoLink, resourceIds } = req.body

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
    })

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
    })
    res.status(200).send(question)
}

const updateQuestion = async (req, res) => {
    const { courseId, examId, questionId } = req.params
    const { topics, number, body, answerChoices, correctChoiceIndices, solutionVideoLink, resourceIds } = req.body

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
    })

    const existingAnswerChoices = answerChoices.filter((answerChoice) => {
        return answerChoice.id !== undefined;
    })

    const question = await prisma.question.update({
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
    })
    res.status(200).send(question)
}

const toggleQuestionPublished = async (req, res) => {
    const { questionId } = req.params
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
    })
    if (!question) {
        throw new NotFoundError("Question not found")
    }
    if (!question.exam.published) {
        throw new Error("Exam must be published")
    }

    const published = !question.published
    await prisma.question.update({
        where: {
            id: questionId
        },
        data: {
            published: published
        }
    })
    res.status(200).send({ message: `Question is now ${published ? "published" : "unpublished"}` })
}

const deleteQuestion = async (req, res) => {
    const { questionId } = req.params
    const question = await prisma.question.delete({
        where: {
            id: questionId
        }
    })

    if (!question) {
        throw new NotFoundError("Question not found")
    }
    res.status(200).send(question)
}

const createQuestionSubmission = async (req, res) => {
    const { questionId } = req.params
    const { selectedChoiceIndices, correct,
        timeStarted, timeEnded, videoStartTime, videoEndTime,
        videoTotalWatchTime, modalStartTime, modalEndTime, modalTotalTime, osFamily } = req.body
    const startTime = new Date(timeStarted)
    const endTime = new Date(timeEnded)
    const videoStart = new Date(videoStartTime)
    const videoEnd = new Date(videoEndTime)
    const modalStart = new Date(modalStartTime)
    const modalEnd = new Date(modalEndTime)


    const timeSpent = (endTime.valueOf() - startTime.valueOf())
    const submission = await prisma.submission.create({
        data: {
            questionId: questionId,
            correct: Boolean(correct),
            selectedIndices: selectedChoiceIndices,
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
    })
    res.status(200).send(submission)
}

const updateSubmission = async (req, res) => {
    const { submissionId } = req.params
    const { timeSpent, videoStartTime,
        videoEndTime, videoTotalWatchTime, modalStartTime,
        modalEndTime, modalTotalTime } = req.body

    const videoStart = validDate(videoStartTime)
    const videoEnd = validDate(videoEndTime)
    const modalStart = validDate(modalStartTime)
    const modalEnd = validDate(modalEndTime)

    const submission = await prisma.submission.update({
        where: {
            id: submissionId
        },
        data: {
            timeSpent: timeSpent,
            videoStartTime: videoStart,
            videoEndTime: videoEnd,
            timeSpentVideo: videoTotalWatchTime,
            modalStartTime: modalStart,
            modalEndTime: modalEnd,
            modalTotalTime: modalTotalTime
        }
    })
    res.status(200).send(submission)
}

export {
    getQuestion,
    createQuestion,
    updateQuestion,
    toggleQuestionPublished,
    deleteQuestion,
    createQuestionSubmission,
    updateSubmission
}