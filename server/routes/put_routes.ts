import {PurdueIoAPI} from "../services/purdue.io";

const { PrismaClient, Season } = require('@prisma/client')
const express = require('express');

const prisma = new PrismaClient();
const app = express();

app.put("/courses/:courseId", async (req, res) => {
    try {
        const { courseId } = req.params
        const { abbreviation, number, backgroundColor, graphicLink, published } = req.body;

        const purdueIoSubject = await PurdueIoAPI.getSubject(abbreviation.toUpperCase());

        if (!purdueIoSubject) {
            res.status(406).send(`Invalid Subject ${abbreviation}`);
            return;
        }

        const stringifiedNumber = String(number);
        const courseNumber = stringifiedNumber + "0".repeat(5 - stringifiedNumber.length);
        const purdueIoCourse = await PurdueIoAPI.getCourse(abbreviation, courseNumber);

        if (!purdueIoCourse) {
            res.status(406).send(`Invalid Course ${abbreviation} ${courseNumber}`);
            return;
        }

        prisma.course.update({
            where: {
                id: courseId
            },
            data: {
                name: purdueIoCourse.Title,
                subject: purdueIoSubject.Name,
                abbreviation: purdueIoSubject.Abbreviation,
                number: Number(courseNumber),
                backgroundColor: backgroundColor,
                graphicLink: graphicLink,
                published: published
            }
        })
            .then((resp) => res.status(200).send(resp))
            .catch((err) => res.status(400).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
})

app.put("/courses/:courseId/exams/:examId", async (req, res) => {
    try {
        const { courseId, examId } = req.params
        const { semester: { season, year }, number, published } = req.body
        let semesterId;
        if (season && year) {
            const semester = await prisma.semester.upsert({
                where: {
                    season_year: {
                        season: Season[season.toUpperCase() as keyof typeof Season],
                        year: Number(year)
                    }
                },
                update: {},
                create: {
                    season: Season[season.toUpperCase() as keyof typeof Season],
                    year: Number(year)
                }
            })
            semesterId = semester.id
            await prisma.course.update({
                where: {
                    id: courseId
                },
                data: {
                    semesters: {
                        connect: {
                            id: semester.id
                        }
                    }
                }
            })
        }

        prisma.exam.update({
            where: {
                id: examId
            },
            data: {
                semesterId: semesterId,
                number: number,
                published: published
            },
            include: {
                semester: true
            }
        })
            .then((resp) => res.status(200).send(resp))
            .catch((err) => res.status(400).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
})

app.put("/courses/:courseId/exams/:examId/questions/:questionId", async (req, res) => {
    try {
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

        prisma.question.update({
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
            .then((resp) => res.status(200).send(resp))
            .catch((err) => res.status(400).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
})

app.put("/topics/:topicId", async (req, res) => {
    try {
        const { topicId } = req.params
        prisma.topic.update({
            where: {
                id: topicId
            },
            data: req.body
        })
            .then((resp) => res.status(200).send(resp))
            .catch((err) => res.status(404).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
})

app.put("/questions/:questionId/submit", async (req, res) => {
    try {
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

        const submissionsTemp = data.submissions

        const timeSpent = (endTime.valueOf() - startTime.valueOf()) / 1000.0
        const timeSpentVideo = (videoEnd.valueOf() - videoStart.valueOf()) / 1000.0
        submissionsTemp[answerChoiceIndex] = submissionsTemp[answerChoiceIndex] + 1

        prisma.question.update({
            where: {
                id: questionId
            },
            data: {
                submissions: submissionsTemp,
            }
        })
        await prisma.submission.create({
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
            .then((resp) => res.status(200).send(resp.id))
            .catch((err) => res.status(404).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = app
export { }