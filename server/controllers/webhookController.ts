import { PurdueIoAPI } from "../services/purdue.io";
import { Request, Response } from "express";
import { DiscordAPI } from "../services/discord.api";
import { CourseAlreadyExistsError, NotFoundError } from "../middleware/errors/index";
import { Prisma, AccountType } from "@prisma/client";

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createCourseRequest = async (req: Request, res: Response) => {

    const { abbreviation, number } = req.body;

    const stringifiedNumber = String(number);
    const courseNumber = stringifiedNumber + "0".repeat(5 - stringifiedNumber.length);
    const purdueIoSubject = await PurdueIoAPI.getSubject(abbreviation.toUpperCase());
    const purdueIoCourse = await PurdueIoAPI.getCourse(purdueIoSubject, courseNumber);

    const existingCourse: Prisma.CourseGetPayload<Prisma.CourseArgs> = await prisma.course.findFirst({
        where: {
            AND: [
                { abbreviation: purdueIoSubject.Abbreviation },
                { number: Number(purdueIoCourse.Number) }
            ]
        }
    });

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

    const courseRequests = await prisma.courseRequest.findMany({});
    const purdueIoTerm = await PurdueIoAPI.getCurrentTerm();

    const fields = courseRequests
        .sort((a, b) => b.requests - a.requests)
        .map(request => {
            const url = `https://purdue.io/${purdueIoTerm.Code}/${request.abbreviation}/${request.id}`;
            return {
                name: `${request.abbreviation}${request.number}`,
                value: `**[${request.requests} Requests](${url})**`,
                inline: true
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

const createBugReport = async (req: Request, res: Response) => {
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
    await DiscordAPI.sendWebhookMessage("Bug Reports", data);
    res.status(200).send("Success");
}

const createQuestionBugReport = async (req: Request, res: Response) => {
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
                    users: true,
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
    const discordUsers = users.filter(user => user.accountType === AccountType.DISCORD);
    const content = discordUsers.map(user => `<@${user.accountId}>`).join("");
    const url = `https://boilerexams-frontend.vercel.app/courses/${abbreviation}${courseNumber}/${semester.season}-${semester.year}-${examNumber}?q=${questionId}`;

    const embed = {
        url: url,
        title: title.replace("Exam 0", "Final Exam"),
        description: description,
        timestamp: new Date().toISOString(),
        color: 15548997,
        footer: { text: footer }
    };

    const data = { embeds: [embed], content: content };
    await DiscordAPI.sendWebhookMessage("Content Reports", data);
    res.status(200).send("Success");
}

const createFeatureRequest = async (req: Request, res: Response) => {
    const { title, description } = req.body;

    const embed = {
        title: title,
        description: description,
        timestamp: new Date().toISOString(),
        color: 10181046,
    };

    const data = { embeds: [embed] };
    await DiscordAPI.sendWebhookMessage("Feature Requests", data);
    res.status(200).send("Success");
}

const createFeedbackReport = async (req: Request, res: Response) => {
    // ToDo Content Feedback Reporting and stuff


    res.status(200).send();
}

const createWebhook = async (req: Request, res: Response) => {
    const { id, token, name, avatar, channelId } = req.body;

    const webhook = await prisma.webhook.upsert({
        where: {
            name: name
        },
        update: {
            id: id,
            token: token,
            avatar: avatar,
            channelId: channelId
        },
        create: {
            id: id,
            token: token,
            name: name,
            avatar: avatar,
            channelId: channelId
        }
    });

    res.status(200).send(webhook);
}

const getCourseRequest = async (req: Request, res: Response) => {
    const { courseRequestId } = req.params;
    const courseRequest = await prisma.courseRequest.findUnique({
        where: {
            id: courseRequestId
        }
    });
    res.status(200).send(courseRequest);
}

const getCourseRequests = async (req: Request, res: Response) => {
    const requests = await prisma.courseRequest.findMany({});
    res.status(200).send(requests);
}

const getWebhook = async (req: Request, res: Response) => {
    const { webhookId } = req.params;

    const webhook = await prisma.webhook.findUnique({
        where: {
            id: webhookId
        }
    });

    res.status(200).send(webhook);
}

const getWebhooks = async (req: Request, res: Response) => {
    const webhooks = await prisma.webhook.findMany({});
    res.status(200).send(webhooks);
}

const deleteWebhook = async (req: Request, res: Response) => {
    const { webhookId } = req.params;

    const webhook = await prisma.webhook.delete({
        where: {
            id: webhookId
        }
    });

    res.status(200).send(webhook);
}

export {
    createCourseRequest,
    createBugReport,
    createQuestionBugReport,
    createFeatureRequest,
    createWebhook,
    getCourseRequest,
    getCourseRequests,
    getWebhook,
    getWebhooks,
    deleteWebhook
};