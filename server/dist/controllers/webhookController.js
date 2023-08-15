var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PurdueIoAPI } from "../services/purdue.io.js";
import { DiscordAPI } from "../services/discord.api.js";
import { CourseAlreadyExistsError, NotFoundError } from "../middleware/errors/index.js";
import { PrismaClient, AccountType } from "@prisma/client";
const prisma = new PrismaClient();
const createCourseRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { abbreviation, number } = req.body;
    const stringifiedNumber = String(number);
    const courseNumber = stringifiedNumber + "0".repeat(5 - stringifiedNumber.length);
    const purdueIoSubject = yield PurdueIoAPI.getSubject(abbreviation.toUpperCase());
    const purdueIoCourse = yield PurdueIoAPI.getCourse(purdueIoSubject, courseNumber);
    const existingCourse = yield prisma.course.findFirst({
        where: {
            AND: [
                { abbreviation: purdueIoSubject.Abbreviation },
                { number: Number(purdueIoCourse.Number) }
            ]
        }
    });
    if (existingCourse)
        throw new CourseAlreadyExistsError(`Existing Course Requested`);
    yield prisma.courseRequest.upsert({
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
                increment: 1 // Increment Request Count if CourseRequest exists
            }
        }
    });
    const courseRequests = yield prisma.courseRequest.findMany({});
    const purdueIoTerm = yield PurdueIoAPI.getCurrentTerm();
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
    yield DiscordAPI.editWebhookMessage("Course Requests", "1127497040822284308", data);
    res.status(200).send("Success");
});
const createBugReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, footer, pingableIds } = req.body;
    const roleIds = ["1074060567339352145", "1078747995979403326", "1078748911298170891", "1074061247647068160"];
    const content = pingableIds ? pingableIds.map(element => {
        if (roleIds.includes(element))
            return `<@&${element}>`;
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
    yield DiscordAPI.sendWebhookMessage("Bug Reports", data);
    res.status(200).send("Success");
});
const createQuestionBugReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { questionId } = req.params;
    const { description, footer } = req.body;
    const question = yield prisma.question.findUnique({
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
    if (!question)
        throw new NotFoundError("Question does not exist");
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
    yield DiscordAPI.sendWebhookMessage("Content Reports", data);
    res.status(200).send("Success");
});
const createFeatureRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description } = req.body;
    const embed = {
        title: title,
        description: description,
        timestamp: new Date().toISOString(),
        color: 10181046,
    };
    const data = { embeds: [embed] };
    yield DiscordAPI.sendWebhookMessage("Feature Requests", data);
    res.status(200).send("Success");
});
const createFeedbackReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // ToDo Content Feedback Reporting and stuff
    res.status(200).send();
});
const createWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, token, name, avatar, channelId } = req.body;
    const webhook = yield prisma.webhook.upsert({
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
});
const getCourseRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseRequestId } = req.params;
    const courseRequest = yield prisma.courseRequest.findUnique({
        where: {
            id: courseRequestId
        }
    });
    res.status(200).send(courseRequest);
});
const getCourseRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requests = yield prisma.courseRequest.findMany({});
    res.status(200).send(requests);
});
const getWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { webhookId } = req.params;
    const webhook = yield prisma.webhook.findUnique({
        where: {
            id: webhookId
        }
    });
    res.status(200).send(webhook);
});
const getWebhooks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const webhooks = yield prisma.webhook.findMany({});
    res.status(200).send(webhooks);
});
const deleteWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { webhookId } = req.params;
    const webhook = yield prisma.webhook.delete({
        where: {
            id: webhookId
        }
    });
    res.status(200).send(webhook);
});
export { createCourseRequest, createBugReport, createQuestionBugReport, createFeatureRequest, createWebhook, getCourseRequest, getCourseRequests, getWebhook, getWebhooks, deleteWebhook };
//# sourceMappingURL=webhookController.js.map