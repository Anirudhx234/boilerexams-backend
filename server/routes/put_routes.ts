const { PrismaClient, Season } = require('@prisma/client')
const express = require('express');

const prisma = new PrismaClient();
const app = express();


module.exports = app;
export {}
/* /courses/:courseId
PUT, DELETE

/courses/:courseId/exams
GET?, POST
POST should add a new exam to this course will always be new data

/courses/:courseId/exams/:examId
PUT, DELETE
PUT will update this exams info
 */