const { PrismaClient } = require('@prisma/client');
import { NotFoundError } from "../middleware/errors"

const prisma = new PrismaClient();

const getQuestion = async (req, res) => {
    const { questionId } = req.params
    const question = await prisma.question.findUnique({
        where: {
            id: questionId
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
    const { selectedChoiceIndex, videoWatched, correct, timeStarted, timeEnded, videoStartTime, videoEndTime } = req.body

    const msToDate = (milliseconds) => new Date(0, 0, 0, 0, 0, 0, milliseconds)
    const startTime = msToDate(timeStarted)
    const endTime = msToDate(timeEnded)
    const videoStart = msToDate(videoStartTime)
    const videoEnd = msToDate(videoEndTime)

    const answerChoiceIndex = Number(selectedChoiceIndex)

    const data = await prisma.question.findUnique({
        where: {
            id: questionId
        },
        select: {
            submissions: true,
        }
    })
    if (!data) {
        throw new NotFoundError("Question not found")
    }

    const submissionsTemp = data.submissions

    const timeSpent = (endTime.valueOf() - startTime.valueOf()) / 1000.0
    const timeSpentVideo = (videoEnd.valueOf() - videoStart.valueOf()) / 1000.0
    submissionsTemp[answerChoiceIndex] = submissionsTemp[answerChoiceIndex] + 1

    await prisma.question.update({
        where: {
            id: questionId
        },
        data: {
            submissions: submissionsTemp,
        }
    })

    const submission = await prisma.submission.create({
        data: {
            questionId: questionId,
            correct: Boolean(correct),
            timeStarted: startTime,
            timeEnded: endTime,
            videoWatched: Boolean(videoWatched),
            timeSpent: Math.floor(timeSpent),
            videoStartTime: videoStart,
            videoEndTime: videoEnd,
            timeSpentVideo: Math.floor(timeSpentVideo)
        }
    })
    res.status(200).send(submission)
}

export {
    getQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    createQuestionSubmission
}