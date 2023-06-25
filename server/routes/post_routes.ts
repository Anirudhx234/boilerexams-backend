const { PrismaClient, Season } = require('@prisma/client')
const express_routes = require('express');
const axios = require('axios');

const prisma = new PrismaClient();
const app = express_routes();

app.post("/courses", async (req, res) => {
    try {
        const { name, subject, abbreviation, number, backgroundColor, graphicLink, published } = req.body
        prisma.course.create({
            data: {
                name: name,
                subject: subject,
                abbreviation: abbreviation,
                number: Number(number),
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
            .then((resp) => res.status(200).send(resp))
            .catch((err) => res.status(400).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
});

app.post("/topics", async (req, res) => {
    try {
        const { name } = req.body
        prisma.topic.create({
            data: {
                name: name
            },
            include: {
                courses: true,
                questions: true
            }
        })
            .then((resp) => res.status(200).send(resp))
            .catch((err) => res.status(400).send(err));
    } catch (e) {
        res.status(400).send(e)
    }
});

app.post("/courses/:courseId/exams", async (req, res) => {
    try {
        const { courseId } = req.params
        const { semester: {season, year}, number } = req.body
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
    } catch (e) {
        res.status(400).send(e)
    }
});

app.post("/courses/:courseId/exams/:examId/questions", async (req, res) => {
    try {
        const { courseId, examId } = req.params
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

        prisma.question.create({
            data: {
                courseId: courseId,
                examId: examId,
                topics: {
                    connect: topics.map((topic) => ({ name: topic }))
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
});

app.post("/courses/requests", async (req, res) => {
    try {
        const { subject, course } = req.body;

        // Parse purdueIo for a valid Subject (MA, CS, AAE, ...)
        const purdueIoSubjectRequest = await axios.get("https://api.purdue.io/odata/Subjects");
        const subjects = await purdueIoSubjectRequest.data.value;
        const purdueSubject = subjects.find(element => element.Abbreviation == "CS");

        if (!purdueSubject) {
            res.status(406).send(`Invalid Subject ${subject}`);
            return;
        }

        // Parse purdueIo for a valid course (MA265, CS180, AEE200, ...)
        const purdueIoCourseRequest = await axios.get(`https://api.purdue.io/odata/Courses?$filter=Subject/Abbreviation eq '${subject}'`);
        const courses = await purdueIoCourseRequest.data.value;
        const purdueCourse = courses.find(element => element.Number == course);

        if (!purdueCourse) {
            res.status(406).send(`Invalid Course Number ${subject} ${course}`);
            return;
        }

        const newCourseRequest = { id: purdueCourse.Id, subject: purdueSubject.Abbreviation, course: purdueCourse.Number, requests: 1 };

        await prisma.courseRequest.upsert({
            where: {
                subject_course: {
                    id: newCourseRequest.id
                }
            },
            create: newCourseRequest,
            update: {
                requests: {
                    increment: 1    // Increment Request Count if CourseRequest exists
                }
            }
        });

        const courseRequests = await prisma.courseRequest.findMany({
            orderBy: {
                subject: 'asc',
                course: 'asc'
            }
        });

        const fields = courseRequests.map(element => {
            return { inline: true, name: `${element.subject} ${element.course}`, value: `${element.requests}` };
        });

        const embed = {
            title: "Course Requests",
            timestamp: new Date().toISOString(),
            color: 5763719,
            fields: fields
        };

        const params = { embeds: [embed] };
        await axios.patch(
            "https://discord.com/api/webhooks/1122297199972335626/j770OhX7mwVN081BXzo5y8ZLRZtoq0QiDl803F8lIsrm2URo1gmh-XmDwHU0zi1wSWFE/messages/1122298402944843807",
            params
        )
            .then((resp) => res.status(200).send(resp))
            .catch((err) => res.status(400).send(err))

    } catch (e) {
        res.status(400).send(e);
    }
});

app.post("/reports", async (req, res) => {
    try {
        const { title, description, userAgent, pingableId, pingableType } = req.body;

        let content: string | null;

        if (pingableType == 0) {
            content = null;
        } else if (pingableType == 1) {
            content = `<@${pingableId}>`;
        } else if (pingableType == 2) {
            content = `<@&${pingableId}>`;
        } else {
            content = null;
        }

        const embed = {
            title: title,
            description: description,
            timestamp: new Date().toISOString(),
            color: 15548997,
            footer: { text: userAgent }
        };

        const params = { embeds: [embed], content: content };
        await axios.post(
            "https://discord.com/api/webhooks/1122297199972335626/j770OhX7mwVN081BXzo5y8ZLRZtoq0QiDl803F8lIsrm2URo1gmh-XmDwHU0zi1wSWFE",
            params
        )
            .then((resp) => res.status(200).send(resp))
            .catch((err) => res.status(400).send(err))

    } catch (e) {
        res.status(400).send(e);
    }
});

app.post("/requests", async (req, res) => {
    try {
        const { title, description } = req.body;

        const embed = {
            title: title,
            description: description,
            timestamp: new Date().toISOString(),
            color: 10181046,
        };

        const params = { embeds: [embed] };
        await axios.post(
            "https://discord.com/api/webhooks/1122297199972335626/j770OhX7mwVN081BXzo5y8ZLRZtoq0QiDl803F8lIsrm2URo1gmh-XmDwHU0zi1wSWFE",
            params
        )
            .then((resp) => res.status(200).send(resp))
            .catch((err) => res.status(400).send(err))

    } catch (e) {
        res.status(400).send(e);
    }
});

module.exports = app;
export { }