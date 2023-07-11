import { NotFoundError } from "../middleware/errors/index";

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

const express = require('express');
const app = express();

const asyncWrapper = require('../middleware/wrappers/asyncWrapper')

// soft deletes -- just changes the published fields to false
// TODO: hard deletes - cascading deletes for courses and exams
app.delete("/courses/softDelete/:courseId", asyncWrapper(async (req, res) => {
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
}));

app.delete("/courses/hardDelete/:courseId", asyncWrapper(async (req, res) => {
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
}));

app.delete("/courses/:courseId/exams/softDelete/:examId", asyncWrapper(async (req, res) => {
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
}));

app.delete("/courses/:courseId/exams/hardDelete/:examId", asyncWrapper(async (req, res) => {
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
}));

// hard delete, since there are no linked relations that require questions
app.delete("/courses/:courseId/exams/:examId/questions/:questionId", asyncWrapper(async (req, res) => {
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
}))

app.delete("/topics/:topicId", asyncWrapper(async (req, res) => {
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
}));

app.delete("/webhooks/:webhookId", asyncWrapper(async (req, res) => {
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
}))

module.exports = app;
export { }