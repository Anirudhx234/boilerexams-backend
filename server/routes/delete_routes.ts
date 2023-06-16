const { PrismaClient, Season } = require('@prisma/client')
const express = require('express');

const prisma = new PrismaClient();
const app = express();

// soft deletes -- just changes the published fields to false
// TODO: hard deletes - cascading deletes for courses and exams
app.delete("/courses/softDelete/:courseId", async(req, res) => {
    const {courseId} = req.params;
    console.log("testing delete")
    prisma.course.update({
        where: {
            id : courseId
        },
        data: {
            published: false
        }
    }).then((response) => res.status(200).send(response))
    .catch((err) => res.status(404).send(err.message))
})

app.delete("/courses/hardDelete/:courseId", async(req, res) => {
    const {courseId} = req.params;
    prisma.course.delete({
        where: {
            id: courseId
        } 
    }).then((response) => res.status(200).send(response))
    .catch((err) => res.status(404).send(err.message))
})
app.delete("/courses/:courseId/exams/:examId", async(req, res) => {
    const {courseId, examId} = req.params
    prisma.exam.update({
        where: {
            id: examId
        },
        data: {
            published: false
        }
    }).then((response) => res.status(200).send(response))
    .catch((err) => res.status(404).send(err.message))
})
// hard delete, since there are no linked relations that require questions
app.delete("/courses/:courseId/exams/:examId/questions/:questionId", async(req,res) => {
    const {courseId, examId, questionId} = req.params
    prisma.question.delete({
        where: {
            id: questionId
        },
    }).then((response) => res.status(200).send(response))
    .catch((err) => res.status(404).send(err.message))
})
module.exports = app;
export {}