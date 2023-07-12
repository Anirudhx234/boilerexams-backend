import { PurdueIoAPI } from "../services/purdue.io";
import { DiscordAPI } from "../services/discordAPI";
import { InvalidCourseError } from "../middleware/errors/index";
import { Prisma } from "@prisma/client";

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const express = require('express');
const app = express();

const courseRequests = async (req, res) => {
    const { subject, course } = req.body;

    // Parse purdueIo for a valid course (MA265, CS180, AEE200, ...)
    const courseNumber = course + "0".repeat(5 - course.length);
    const subjectAbbreviation = subject.toUpperCase();
    const purdueIoCourse = await PurdueIoAPI.getCourse(subjectAbbreviation, courseNumber);

    if (!purdueIoCourse) {
        res.status(406).send(`Invalid Course ${subjectAbbreviation} ${courseNumber}`);
        return;
    }

    const existingCourse: Prisma.CourseGetPayload<Prisma.CourseArgs> = await prisma.course.findFirst({
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

    const newCourseRequest = { id: purdueIoCourse.Id, subject: subjectAbbreviation, course: courseNumber, requests: 1 };

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

    const data = { embeds: [embed] };
    await DiscordAPI.editWebhookMessage("Course Requests", "1127497040822284308", data)
        .then(() => res.status(200).send("Success"));
};

const bugReports = async (req, res) => {
    const { title, description, footer, pingableIds } = req.body

    const roleIds = ["1074060567339352145", "1078747995979403326", "1078748911298170891", "1074061247647068160"];

    const content = pingableIds ? pingableIds.map(element => {
        if (roleIds.includes(element)) return `<@&${element}>`;
        return `<@${element}>`;
    }).join("") : null;

    const embed = {
        title: title,
        description: description,
        timestamp: new Date().toISOString(),
        color: 15548997,
        footer: { text: footer }
    };

    const data = { embeds: [embed], content: content };
    await DiscordAPI.sendWebhookMessage("Bug Reports", data)
        .then(() => res.status(200).send("Success"));
}

const questionBugReports = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { description, footer } = req.body;

        const question = await prisma.question.findUnique({
            where: {
                id: questionId
            },
            include: {
                course: {
                    select: {
                        abbreviation: true,
                        number: true,
                        users: {
                            include: {
                                accounts: true
                            }
                        },
                    }
                },
                exam: {
                    select: {
                        number: true,
                        semester: true
                    }
                }
            }
        });

        if (!question) {
            res.status(404).send("Question does not exist");
            return;
        }

        const course = question.course;
        const exam = question.exam;
        const abbreviation = course.abbreviation;
        const courseNumber = course.number;
        const users = course.users;
        const examNumber = exam.number;
        const semester = exam.semester;
        const title = `${abbreviation}${courseNumber} | ${semester.season} ${semester.year} | Exam ${examNumber} | Question ${question.number}`;
        const accounts = users.map(user => user.accounts.filter(account => account.provider == "discord")).flat();
        const content = accounts.map(account => `<@${account.providerAccountId}>`).join("");
        const url = `https://boilerexams-frontend.vercel.app/courses/${abbreviation}${courseNumber}/${semester.season}-${semester.year}-${examNumber}?q=${questionId}`;

        const embed = {
            url: url,
            title: title,
            description: description,
            timestamp: new Date().toISOString(),
            color: 15548997,
            footer: { text: footer }
        };

        const data = { embeds: [embed], content: content };
        await DiscordAPI.sendWebhookMessage("Content Reports", data)
            .then(() => res.status(200).send("Success"));

    } catch (e) {
        res.status(400).send(e);
    }
}

const featureRequests = async (req, res) => {
    try {
        const { title, description } = req.body;

        const embed = {
            title: title,
            description: description,
            timestamp: new Date().toISOString(),
            color: 10181046,
        };

        const data = { embeds: [embed] };
        await DiscordAPI.sendWebhookMessage("Feature Requests", data)
            .then(() => res.status(200).send("Success"));

    } catch (e) {
        res.status(400).send(e);
    }
}

const createWebhook = async (req, res) => {
    try {
        const { id, token, name, avatar, channelId } = req.body;

        prisma.webhook.create({
            data: {
                id: id,
                token: token,
                name: name,
                avatar: avatar,
                channelId: channelId
            }
        })
            .then((resp) => res.status(200).send(resp))
            .catch((err) => res.status(400).send(err))

    } catch (e) {
        res.status(400).send(e);
    }
}

module.exports = {
    courseRequests,
    bugReports,
    questionBugReports,
    featureRequests,
    createWebhook
}