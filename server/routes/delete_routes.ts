import {NotFoundError} from "../middleware/errors/index";

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

const express = require('express');
const app = express();

// soft deletes -- just changes the published fields to false
// TODO: hard deletes - cascading deletes for courses and exams
app.delete("/courses/softDelete/:courseId", async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const course = await prisma.course.update({
            where: {
                id: courseId
            },
            data: {
                published: false
            }
        })

        if (!course) {
            throw new NotFoundError("Course not found")
        }
        res.status(200).send(course)
    } catch (error) {
        next(error)
    }
})

app.delete("/courses/hardDelete/:courseId", async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const course = await prisma.course.delete({
            where: {
                id: courseId
            }
        })
        
        if (!course) {
            throw new NotFoundError("Course not found")
        }
        res.status(200).send(course)
    } catch (error) {
        next(error)
    }
})

app.delete("/courses/:courseId/exams/softDelete/:examId", async (req, res, next) => {
    try {
        const { examId } = req.params
        const exam = await prisma.exam.update({
            where: {
                id: examId
            },
            data: {
                published: false
            }
        })
        
        if (!exam) {
            throw new NotFoundError("Exam not found")
        }
        res.status(200).send(exam)
    } catch (error) {
        next(error)
    }
})

app.delete("/courses/:courseId/exams/hardDelete/:examId", async (req, res, next) => {
    try {
        const { examId } = req.params
        const exam = await prisma.exam.delete({
            where: {
                id: examId
            }
        })
        
        if (!exam) {
            throw new NotFoundError("Exam not found")
        }
        res.status(200).send(exam)
    } catch (error) {
        next(error)
    }
})

// hard delete, since there are no linked relations that require questions
app.delete("/courses/:courseId/exams/:examId/questions/:questionId", async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error)
    }
})

app.delete("/topics/:topicId", async (req, res, next) => {
    try {
        const { topicId } = req.params;
        const topic = await prisma.topic.delete({
            where: {
                id: topicId
            }
        })

        if (!topic) {
            throw new NotFoundError("Topic not found")
        }
        res.status(200).send(topic)
    } catch (error) {
        next(error)
    }
})

app.delete("/webhooks/:webhookId", async (req, res, next) => {
    try {
        const { webhookId } = req.params;
        const webhook = await prisma.webhook.delete({
            where: {
                id: webhookId
            }
        })

        if (!webhook) {
            throw new NotFoundError("Webhook not found")
        }
        res.status(200).send(webhook)
    } catch (error) {
        next(error)
    }
})

module.exports = app;
export { }