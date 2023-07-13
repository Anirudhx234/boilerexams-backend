import { PurdueIoAPI } from "../services/purdue.io";
import { DiscordAPI } from "../services/discord.api";
import { CourseAlreadyExistsError, NotFoundError } from "../middleware/errors/index";
import {Prisma} from "@prisma/client";

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

const courseRequests = async (req, res) => {

    const { abbreviation, number } = req.body;

    const purdueIoSubject = await PurdueIoAPI.getSubject(abbreviation.toUpperCase());
    const stringifiedNumber = String(number);
    const courseNumber = stringifiedNumber + "0".repeat(5 - stringifiedNumber.length);
    const purdueIoCourse = await PurdueIoAPI.getCourse(abbreviation.toUpperCase(), courseNumber);

    const existingCourse: Prisma.CourseGetPayload<Prisma.CourseArgs> = await prisma.course.findFirst({
        where: {
            AND: [
                { abbreviation: purdueIoSubject.Abbreviation },
                { number: Number(purdueIoCourse.Number) }
            ]
        }
    })

    if (existingCourse) throw new CourseAlreadyExistsError(`Existing Course Requested`);


    await prisma.courseRequest.upsert({
        where: {
            id: purdueIoCourse.Id
        },
        create: {
            id: purdueIoCourse.Id,
            name: purdueIoCourse.Title,
            subject: purdueIoSubject.Name,
            abbreviation: purdueIoSubject.Abbreviation,
            number: Number(purdueIoCourse.Number),
        },
        update: {
            requests: {
                increment: 1    // Increment Request Count if CourseRequest exists
            }
        }
    });

    const courseRequests = await prisma.courseRequest.findMany({
        orderBy: [
            {
                abbreviation: 'asc',
            },
            {
                number: 'asc',
            }
        ]
    });


    const fields = courseRequests.map(element => {
        return {
            inline: true, name: `${element.abbreviation} ${element.number}`, value: `${element.requests}`
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
    res.status(200).send("Success")
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
    res.status(200).send("Success")
}

const questionBugReports = async (req, res) => {
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

    if (!question) throw new NotFoundError("Question does not exist");

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
    res.status(200).send("Success")
}

const featureRequests = async (req, res) => {
    const { title, description } = req.body;

    const embed = {
        title: title,
        description: description,
        timestamp: new Date().toISOString(),
        color: 10181046,
    };

    const data = { embeds: [embed] };
    await DiscordAPI.sendWebhookMessage("Feature Requests", data)
    res.status(200).send("Success")
}

const createWebhook = async (req, res) => {
    const { id, token, name, avatar, channelId } = req.body;

    const webhook = await prisma.webhook.create({
        data: {
            id: id,
            token: token,
            name: name,
            avatar: avatar,
            channelId: channelId
        }
    })
    res.status(200).send(webhook)
}

const updateWebhook = async (req, res) => {
    const { webhookId } = req.params
    const { avatar } = req.body

    const webhook = await prisma.webhook.update({
        where: {
            id: webhookId
        },
        data: {
            avatar: avatar,
        }
    })
    res.status(200).send(webhook)
}

module.exports = {
    courseRequests,
    bugReports,
    questionBugReports,
    featureRequests,
    createWebhook,
    updateWebhook
}