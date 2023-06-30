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

        // Parse purdueIo for a valid course (MA265, CS180, AEE200, ...)
        const courseNumber = course + "0".repeat(5 - course.length);
        const subjectAbbreviation = subject.toUpperCase();
        const purdueIoCourseRequest = await axios.get(`https://api.purdue.io/odata/Courses?$filter=Subject/Abbreviation eq '${subjectAbbreviation}'`);
        const courses = await purdueIoCourseRequest.data.value;
        const purdueCourse = courses.find(element => element.Number === courseNumber);

        if (!purdueCourse) {
            res.status(406).send(`Invalid Course ${subjectAbbreviation} ${courseNumber}`);
            return;
        }

        const existingCourse = await prisma.course.findFirst({
            where: {
                AND: [
                    { abbreviation: subjectAbbreviation },
                    { number: Number(courseNumber) }
                ]
            }
        })

        if (existingCourse) {
            res.status(202).send("Existing Course Requested");
            return;
        }

        const newCourseRequest = { id: purdueCourse.Id, subject: subjectAbbreviation, course: courseNumber, requests: 1 };

        await prisma.courseRequest.upsert({
            where: {
                id: newCourseRequest.id
            },
            create: newCourseRequest,
            update: {
                requests: {
                    increment: 1    // Increment Request Count if CourseRequest exists
                }
            }
        });

        const courseRequests = await prisma.courseRequest.findMany({
            orderBy: [
                {
                    subject: 'asc',
                },
                {
                    course: 'asc',
                }
            ]
        });

        const fields = courseRequests.map(element => {
            return {
                inline: true, name: `${element.subject} ${element.course}`, value: `${element.requests}`
            };
        });

        const embed = {
            title: "Course Requests",
            timestamp: new Date().toISOString(),
            color: 5763719,
            fields: fields
        };

        const params = { embeds: [embed] };
        await axios.patch(
            "https://discord.com/api/webhooks/1124126024783904868/MPh2dKS2R52m0aG1XiD9bsKwTdIb3g4hBMTsPlUUln2JVyDBQGODjXoHJtUUn3mXFO8R/messages/1124126242208235570",
            params
        )
            .then(() => res.status(200).send())
            .catch((err) => res.status(400).send(err))

    } catch (e) {
        res.status(400).send(e);
    }
});

app.post("/bug-reports", async (req, res) => {
    try {
        const { title, description, userAgent, pingableIds, pingableType } = req.bod

        const content = pingableIds ? pingableIds.map(element => {
            if (pingableType == 1) return `<@${element}>`;
            if (pingableType == 2) return `<@&${element}>`;
            return null;
        }).join("") : null;

        const embed = {
            title: title,
            description: description + `\n\nIf this has pinged the wrong person or role please <@&1078747995979403326> or <@&1078748911298170891> appropriately.`,
            timestamp: new Date().toISOString(),
            color: 15548997,
            footer: { text: userAgent }
        };

        const params = { embeds: [embed], content: content };
        await axios.post(
            "https://discord.com/api/webhooks/1122297351344758896/H7cA4si1ZoWPBtPsLPWYZalAuYbCCcMVkf7NbRj6HbQf27_i5pp6lr-T5K0din004raE",
            params
        )
            .then(() => res.status(200).send())
            .catch((err) => res.status(400).send(err))

    } catch (e) {
        res.status(400).send(e);
    }
});

app.post("/feature-requests", async (req, res) => {
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
            "https://discord.com/api/webhooks/1122664339103547423/Va97wFs0iiFGWeq3TsjFrrsLBAi-mllyrETYyotkE6o9geHLn0xLylfN-VrS-EX7aja5",
            params
        )
            .then(() => res.status(200).send())
            .catch((err) => res.status(400).send(err))

    } catch (e) {
        res.status(400).send(e);
    }
});

module.exports = app;
export { }