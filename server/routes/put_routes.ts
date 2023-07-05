const { PrismaClient, Season } = require('@prisma/client')
const express = require('express');

const prisma = new PrismaClient();
const app = express();

app.put("/courses/:courseId", async (req, res) => {
    try {
        const { courseId } = req.params
        prisma.course.update({
            where: {
                id: courseId
            },
            data: req.body
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
        const { topics, number, body, answerChoices, correctChoiceIndex, solutionVideoLink, resources } = req.body

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
                            notIn: answerChoices.map((answerChoice) => answerChoice.id)
                        }
                    },
                    upsert: answerChoices.map((answerChoice) => ({
                        where: {
                            id: answerChoice.id
                        },
                        update: {
                            choiceIndex: Number(answerChoice.choiceIndex),
                            body: answerChoice.body,
                            resources: {
                                deleteMany: {
                                    id: {
                                        notIn: answerChoice.resources
                                    }
                                },
                                connect: answerChoice.resources.map((resourceId) => ({ id: resourceId }))
                            }
                        },
                        create: {
                            choiceIndex: Number(answerChoice.choiceIndex),
                            body: answerChoice.body,
                            resources: {
                                connect: answerChoice.resources.map((resourceId) => ({ id: resourceId }))
                            }
                        }
                    }))
                },
                correctChoiceIndex: Number(correctChoiceIndex),
                solutionVideoLink: solutionVideoLink,
                resources: {
                    deleteMany: {
                        id: {
                            notIn: resources
                        }
                    },
                    connect: resources.map((resourceId) => ({ id: resourceId }))
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
app.put("/questions/:questionId/submit/answerChoiceIndex=:index", async (req, res) => {
    try {
        const { questionId, index } = req.params
        const answerChoiceIndex = Number(index)
        let { submissions } = await prisma.question.findUnique({
            where: {
                id: questionId
            },
            select: {
                submissions: true
            }
        })
        if (!submissions) {
            submissions = [0, 0, 0, 0, 0]
        }
        submissions[answerChoiceIndex] = submissions[answerChoiceIndex] + 1
        prisma.question.update({
            where: {
                id: questionId
            },
            data: {
                submissions: submissions
            }
        })
            .then((resp) => res.status(200).send(resp))
            .catch((err) => res.status(404).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = app
export { }