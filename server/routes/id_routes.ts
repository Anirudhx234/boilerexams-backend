const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

const express = require('express');
const app = express();

const cache = require('../cache/caching');

app.get("/id/courses/:courseId/topics", cache(300), async (req, res) => {
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
            if (course) {
                return res.status(200).send(course.topics)
            }
            else {
                return res.status(404).send("Course not found")
            }
        })
        .catch((err) => res.status(400).send(err.message))
});

app.get("/id/courses/:courseId/semesters", cache(300), async (req, res) => {
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
            if (course) {
                return res.status(200).send(course.semesters)
            }
            else {
                return res.status(404).send("Course not found")
            }
        })
        .catch((err) => res.status(400).send(err.message))
});

app.get("/id/courses/:courseId/:semesterId/exams", cache(300), async (req, res) => {
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

app.get("/id/exams/:examId/questions", cache(300), async (req, res) => {
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
            if (exam) {
                res.status(200).send(exam.questions)
            } else {
                res.status(404).send("Exam not found")
            }
        })
        .catch((err) => res.status(400).send(err.message))
})

app.get("/id/courses/:courseId/:topicId/questions", cache(300), async (req, res) => {
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
                res.status(404).send("Topic not found")
            }
        })
        .catch((err) => res.status(400).send(err.message))
})

app.get("/id/questions/:questionId", cache(300), async (req, res) => {
    try {
        const { questionId } = req.params
        prisma.question.findUnique({
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
            .then((resp) => {
                if (resp) {
                    res.status(200).send(resp)
                } else {
                    res.status(404).send("Question not found")
                }
            })
            .catch((err) => res.status(400).send(err.message))
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = app;
export { }