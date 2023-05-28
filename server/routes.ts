import express from 'express'
import { PrismaClient, Season } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()

const multer = require('multer');
const Aws = require('aws-sdk');

const dotenv = require("dotenv");
dotenv.config();

app.post("/course", async (req, res) => {
    const { code, name } = req.body
    prisma.course.create({
        data: {
            code: code,
            name: name
        }
    })
        .then((resp) => res.status(200).send(resp))
        .catch((err) => res.status(400).send(err.message))
});

app.post("/exam", async (req, res) => {
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

app.post("/topic", async (req, res) => {
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

app.post("/question", async (req, res) => {
    const { course, exam, topics, number, body, answerChoices, correctAnswer, solution } = req.body
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
                    correctAnswer: Number(correctAnswer),
                    solution: solution
                }
            }
        }
    })
        .then((response) => res.status(200).send(response))
        .catch((err) => res.status(400).send(err.message));
});

app.get("/courses", async (req, res) => {
    prisma.course.findMany()
        .then((courses) => res.status(200).send(courses))
        .catch((err) => res.status(400).send(err.message))
});

app.get("/topics", async (req, res) => {
    prisma.topic.findMany()
        .then(topics => res.status(200).send(topics))
        .catch((err) => res.status(400).send(err.message))
});

app.get("/courses/:courseId/topics", async (req, res) => {
    const { courseId } = req.params
    prisma.course.findUnique({
        where: {
            id: courseId
        },
        select: {
            topics: true
        }
    })
        .then((course) => {
            if (!course) {
                res.status(200).send([])
            }
            else {
                res.status(200).send(course.topics)
            }
        })
        .catch((err) => res.status(400).send(err.message))
});

app.get("/courses/:courseId/semesters", async (req, res) => {
    const { courseId } = req.params
    prisma.course.findUnique({
        where: {
            id: courseId
        },
        select: {
            semesters: {
                orderBy: {
                    year: 'asc'
                }
            }
        }
    })
        .then((course) => {
            if (!course) {
                res.status(200).send([])
            }
            else {
                res.status(200).send(course.semesters)
            }
        })
        .catch((err) => res.status(400).send(err.message))
});

app.get("/courses/:courseId/:semesterId/exams", async (req, res) => {
    const { courseId, semesterId } = req.params
    prisma.exam.findMany({
        where: {
            courseId: courseId,
            semesterId: semesterId
        },
        orderBy: {
            number: 'asc'
        }
    })
        .then((exams) => res.status(200).send(exams))
        .catch((err) => res.status(400).send(err.message))
});

app.get("/exams/:examId/questions", async (req, res) => {
    const { examId } = req.params
    prisma.exam.findUnique({
        where: {
            id: examId
        },
        select: {
            questions: {
                orderBy: {
                    number: 'asc'
                }
            }
        }
    })
    .then((exam) => {
        if(exam) {
            res.status(200).send(exam.questions)
        } else {
            res.status(200).send([])
        }
    })
    .catch((err) => res.status(400).send(err.message))
})

app.get("/courses/:courseId/:topicId/questions", async (req, res) => {
    const { courseId, topicId } = req.params;
    prisma.topic.findUnique({
        where: {
            id: topicId
        },
        select: {
            questions: {
                where: {
                    id: courseId
                }
            }
        }
    })
    .then((topic) => {
        if (topic) {
            res.status(200).send(topic.questions)
        }
        else {
            res.status(200).send([])
        }
    })
    .catch((err) => res.status(400).send(err.message))
})

module.exports = app;