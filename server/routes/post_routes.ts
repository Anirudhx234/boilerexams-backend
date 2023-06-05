const { PrismaClient, Season } = require('@prisma/client')
const express_routes = require('express');

const prisma = new PrismaClient();
const app = express_routes();

app.post("/courses", async (req, res) => {
    const { name, subject, number, backgroundColor, graphicLink } = req.body
    prisma.course.create({
        data: {
            name: name,
            subject: subject,
            number: Number(number),
            backgroundColor: backgroundColor,
            graphicLink: graphicLink
        }
    })
        .then((resp) => res.status(200).send(resp))
        .catch((err) => res.status(400).send(err.message))
});

app.post("/exams", async (req, res) => {
    const { course, season, year, number } = req.body
    const semester = await prisma.semester.upsert({
        where: {
            season_year: {
                season: Season[season as keyof typeof Season],
                year: Number(year)
            }
        },
        update: {},
        create: {
            season: Season[season as keyof typeof Season],
            year: Number(year)
        }
    })

    prisma.course.update({
        where: {
            id: course
        },
        data: {
            exams: {
                create: {
                    number: Number(number),
                    semester: {
                        connect: {
                            id: semester.id
                        }
                    }
                }
            },
            semesters: {
                connect: {
                    id: semester.id
                }
            }
        }
    })
        .then(exam => res.status(200).send(exam))
        .catch((err) => res.status(400).send(err.message))
})

app.post("/topics", async (req, res) => {
    const { name } = req.body
    prisma.topic.create({
        data: {
            name: name
        }
    })
        .then(() => res.status(200).send("success"))
        .catch((err) => res.status(400).send(err.message));
});

app.post("/course-topics", async (req, res) => {
    const { course, topics } = req.body;
    prisma.course.update({
        where: {
            id: course
        },
        data: {
            topics: {
                connect: topics.map(topicId => ({ id: topicId }))
            }
        }
    })
        .then((response) => res.status(200).send(response))
        .catch((err) => res.status(400).send(err.message));
});

app.post("/questions", async (req, res) => {
    const { course, exam, topics, number, body, answerChoices, correctChoiceIndex, solution } = req.body
    prisma.exam.update({
        where: {
            id: exam
        },
        data: {
            questions: {
                create: {
                    course: {
                        connect: {
                            id: course
                        }
                    },
                    topics: {
                        connect: topics.map(topicId => ({ id: topicId }))
                    },
                    number: Number(number),
                    body: body,
                    answerChoices: answerChoices,
                    correctChoiceIndex: Number(correctChoiceIndex),
                    solutionVideoLink: solution
                }
            }
        }
    })
        .then((response) => res.status(200).send(response))
        .catch((err) => res.status(400).send(err.message));
});

module.exports = app;
export {}