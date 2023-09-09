import prisma from "../libs/prisma.js";
import { PurdueIoAPI } from "../services/purdue.io.js";
import { Request, Response } from "express";
import { DiscordAPI } from "../services/discord.api.js";
import getPingsFromLocation from "../helpers/webhooks/getPingsFromLocation.js";
import { APIError, CourseAlreadyExistsError, NotFoundError } from "../middleware/errors/index.js";
import { AccountType } from "@prisma/client";
import { AttachmentBuilder, Colors, EmbedBuilder, WebhookClient } from "discord.js";
import { pdfToPng } from "pdf-to-png-converter";

const createApplication = async (req: Request, res: Response) => {
    const { name, email, year, why } = req.body;
    const file = req.file;

    if (!file) {
        throw new APIError("No file attached", 400);
    }

    const pngPages = await pdfToPng(file.buffer, // The function accepts PDF file path or a Buffer
        {
            disableFontFace: true,
            useSystemFonts: true,
            enableXfa: false,
            viewportScale: 4.0,
            outputFileMask: 'buffer',
            pagesToProcess: [1],
            verbosityLevel: 0
        });
    const attachment = new AttachmentBuilder(pngPages[0].content, { name: "pdf.png" });
    const embed = new EmbedBuilder()
        .setTitle(name)
        .setDescription(why)
        .setColor(Colors.Blue)
        .setFooter({ text: `${year} - ${email}` })
        .setImage("attachment://pdf.png");

    const webhook = await DiscordAPI.getWebhook("Applications");
    const webhookUrl = `https://discord.com/api/webhooks/${webhook?.id}/${webhook?.token}`;
    const webhookClient = new WebhookClient({ url: webhookUrl });
    await webhookClient.send({ embeds: [embed], files: [attachment] });

    res.status(200).send("Success");
}

const createCourseRequest = async (req: Request, res: Response) => {

    const { abbreviation, number } = req.body;

    const stringifiedNumber = String(number);
    const courseNumber = stringifiedNumber + "0".repeat(5 - stringifiedNumber.length);
    const purdueIoSubject = await PurdueIoAPI.getSubject(abbreviation.toUpperCase());
    const purdueIoCourse = await PurdueIoAPI.getCourse(purdueIoSubject, courseNumber);

    const existingCourse = await prisma.course.findFirst({
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
    await DiscordAPI.editWebhookMessage("Course Requests", "1146116623267270806", data)
    res.status(200).send("Success")
};

const createBugReport = async (req: Request, res: Response) => {
    const { title, description, footer, location } = req.body
    const user = req.user;
    const content = getPingsFromLocation(location).concat(user ? ` from <@${user.accountId}>` : '');

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
    const { referer, description, footer } = req.body;

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

    const user = req.user;
    const course = question.course;
    const exam = question.exam;
    const abbreviation = course.abbreviation;
    const courseNumber = course.number;
    const users = course.users;
    const examNumber = exam.number;
    const semester = exam.semester;
    const title = `${abbreviation}${courseNumber} | ${semester.season} ${semester.year} | Exam ${examNumber} | Question ${question.number}`;
    const discordUsers = users.filter(user => user.accountType === AccountType.DISCORD);
    const content = discordUsers.map(user => `<@${user.accountId}>`).join("").concat(user ? ` from <@${user.accountId}>` : '');

    const embed = {
        url: referer,
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
    const user = req.user;
    const content = user ? `From <@${user.accountId}>` : undefined;

    const embed = {
        title: title,
        description: description,
        timestamp: new Date().toISOString(),
        color: 10181046,
    };

    const data = { content: content, embeds: [embed] };
    await DiscordAPI.sendWebhookMessage("Feature Requests", data);
    res.status(200).send("Success");
}

const createFeedbackReport = async (req: Request, res: Response) => {
    // ToDo Content Feedback Reporting and stuff
    type QualityRating = 1 | 2 | 3 | 4 | 5;
    type Feedback = {
        explanationQuality: QualityRating,
        productionQuality: QualityRating,
        videoRecommendation: boolean,
        additionalFeedback: string
    };

    const { questionId } = req.params;
    const feedback = req.body as Feedback;



    res.status(200).send();
}

const upsertWebhook = async (req: Request, res: Response) => {
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
    createApplication,
    createCourseRequest,
    createBugReport,
    createQuestionBugReport,
    createFeatureRequest,
    createFeedbackReport,
    upsertWebhook,
    getCourseRequest,
    getCourseRequests,
    getWebhook,
    getWebhooks,
    deleteWebhook
};
