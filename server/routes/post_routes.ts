import { PurdueIoAPI } from "../services/purdue.io";
import { InvalidCourseError } from "../middleware/errors/index";
import {Prisma} from "@prisma/client";

const { PrismaClient, Season } = require('@prisma/client')
const prisma = new PrismaClient();
const express = require('express');
const app = express();

const asyncWrapper = require('../middleware/wrappers/asyncWrapper')


app.post("/courses", asyncWrapper(async (req, res) => {
    const { abbreviation, number, backgroundColor, graphicLink, published } = req.body

    const purdueIoSubject = await PurdueIoAPI.getSubject(abbreviation.toUpperCase());
    const stringifiedNumber = String(number);
    const courseNumber = stringifiedNumber + "0".repeat(5 - stringifiedNumber.length);
    const purdueIoCourse = await PurdueIoAPI.getCourse(abbreviation.toUpperCase(), courseNumber);

    const course = await prisma.course.create({
        data: {
            name: purdueIoCourse.Title,
            subject: purdueIoSubject.Name,
            abbreviation: purdueIoSubject.Abbreviation,
            number: Number(courseNumber),
            backgroundColor: backgroundColor,
            graphicLink: graphicLink,
            published: published
        },
        include: {
            exams: true,
            semesters: true,
            topics: true,
            questions: true
        }
    })
    res.status(200).send(course)
}));


app.post("/topics", asyncWrapper(async (req, res) => {
    const { name } = req.body
    const topic = await prisma.topic.create({
        data: {
            name: name
        },
        include: {
            courses: true,
            questions: true
        }
    })

    res.status(200).send(topic)
}));

app.post("/courses/:courseId/exams", asyncWrapper(async (req, res) => {
    const { courseId } = req.params
    const { semester: { season, year }, number } = req.body

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

    prisma.exam.create({
        data: {
            courseId: courseId,
            number: Number(number),
            semesterId: semester.id
        },
        include: {
            semester: true,
            questions: true
        }
    })
        .then(exam => res.status(200).send(exam))
        .catch((err) => res.status(400).send(err))
}));

app.post("/courses/:courseId/exams/:examId/questions", async (req, res) => {
    try {
        const { courseId, examId } = req.params
        const { topics, number, body, answerChoices, correctChoiceIndices, solutionVideoLink, resourceIds } = req.body

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

        prisma.question.create({
            data: {
                courseId: courseId,
                examId: examId,
                topics: {
                    connect: topics.map((topic) => ({ name: topic }))
                },
                number: Number(number),
                body: body,
                answerChoices: {
                    create: answerChoices.map((answerChoice) => ({
                        choiceIndex: Number(answerChoice.choiceIndex),
                        body: answerChoice.body,
                        resources: {
                            connect: answerChoice.resourceIds.map((resourceId) => ({ id: resourceId }))
                        }
                    }))
                },
                correctChoiceIndices: correctChoiceIndices,
                solutionVideoLink: solutionVideoLink,
                resources: {
                    connect: resourceIds.map((resourceId) => ({ id: resourceId }))
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
});


module.exports = app;
export { }