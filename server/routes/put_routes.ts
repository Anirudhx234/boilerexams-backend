const { PrismaClient, Season } = require('@prisma/client')
const express_routes = require('express');

const prisma = new PrismaClient();
const app = express_routes();

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
        const { semester: { season, year }, number } = req.body
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
                number: number
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
        const { topics, number, body, answerChoices, correctChoiceIndex, solutionVideoLink } = req.body

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
                answerChoices: answerChoices,
                correctChoiceIndex: Number(correctChoiceIndex),
                solutionVideoLink: solutionVideoLink
            },
            include: {
                topics: true
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

module.exports = app
export { }