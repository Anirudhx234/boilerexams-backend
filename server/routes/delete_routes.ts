const { PrismaClient} = require('@prisma/client')
const express = require('express');

const prisma = new PrismaClient();
const app = express();

// soft deletes -- just changes the published fields to false
// TODO: hard deletes - cascading deletes for courses and exams
app.delete("/courses/softDelete/:courseId", async (req, res) => {
    try {
        const { courseId } = req.params;
        prisma.course.update({
            where: {
                id: courseId
            },
            data: {
                published: false
            }
        })
            .then((response) => res.status(200).send(response))
            .catch((err) => res.status(404).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
})

app.delete("/courses/hardDelete/:courseId", async (req, res) => {
    try {
        const { courseId } = req.params;
        prisma.course.delete({
            where: {
                id: courseId
            }
        })
            .then((response) => res.status(200).send(response))
            .catch((err) => res.status(404).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
})

app.delete("/courses/:courseId/exams/softDelete/:examId", async (req, res) => {
    try {
        const { examId } = req.params
        prisma.exam.update({
            where: {
                id: examId
            },
            data: {
                published: false
            }
        })
            .then((response) => res.status(200).send(response))
            .catch((err) => res.status(404).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
})

app.delete("/courses/:courseId/exams/hardDelete/:examId", async (req, res) => {
    try {
        const { examId } = req.params
        prisma.exam.delete({
            where: {
                id: examId
            }
        })
            .then((response) => res.status(200).send(response))
            .catch((err) => res.status(404).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
})

// hard delete, since there are no linked relations that require questions
app.delete("/courses/:courseId/exams/:examId/questions/:questionId", async (req, res) => {
    try {
        const { questionId } = req.params
        prisma.question.delete({
            where: {
                id: questionId
            },
        })
            .then((response) => res.status(200).send(response))
            .catch((err) => res.status(404).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
})

app.delete("/topics/:topicId", async(req, res) => {
    try {
        const {topicId} = req.params;
        prisma.topic.delete({
            where: {
                id: topicId
            }
        }).then((response) => res.status(200).send(response))
        .catch((err) => res.status(404).send(err))
    } catch(err) {
        res.status(400).send(err)
    }
})

module.exports = app;
export { }