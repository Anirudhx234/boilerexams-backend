import { AnswerChoiceStats, CourseStats, ExamStats, QuestionStats, TopicStats } from "../controllers/statsController.js";
import { deleteFileFromS3 } from "../utils/uploadFileToS3.js";
import { Feedback, PrismaClient } from "@prisma/client";
import { UrlResourceData } from "../controllers/resourceController.js";
import FlagDecoder from "../helpers/decoder.js";
import { z } from "zod";
import bugSubmissionTemplate from "../utils/emailTemplates/bugSubmission.js";
import sendMail from "../utils/sendMail.js";
import { DiscordAPI } from "../services/discord.api.js";
import { FeatureRequestData } from "../controllers/feedbackController.js";

const prisma = new PrismaClient();

export default prisma
    .$extends({
        model: {},
    })
    .$extends({
        query: {
            resource: {
                async update({ query, args }) {
                    const oldResource = await prisma.resource.findUniqueOrThrow({
                        where: {
                            id: args.where.id,
                        },
                    });
                    const newResource = await query(args);

                    const oldResult = UrlResourceData.safeParse(oldResource.data);
                    const newResult = UrlResourceData.safeParse(newResource.data);

                    if (oldResult.success && newResult.success) {
                        const oldData = oldResult.data;
                        const newData = newResult.data;

                        if (oldData.key != newData.key) {
                            if (oldData.key) {
                                await deleteFileFromS3(oldData.key);
                            }
                        }
                    }
                },
                // Hook into resource delete query
                async delete({ query, args }) {
                    const resource = await query(args);
                    const result = UrlResourceData.safeParse(resource.data);

                    if (result.success) {
                        if (result.data.key) {
                            await deleteFileFromS3(result.data.key);
                        }
                    }

                    return resource;
                },
            },
            feedback: {
                async create({ query, args }) {
                    const feedback = await query(args) as Feedback;
                    const dataParse = FeatureRequestData.safeParse(feedback.data);

                    if (!dataParse.success) return feedback;

                    const emailParse = z.string().email().safeParse(dataParse.data.contact);

                    if (emailParse.success) {
                        const emailOptions = {
                            to: emailParse.data,
                            subject: `Bug Report: ${feedback.id}`,
                            html: bugSubmissionTemplate(feedback.id, dataParse.data.title),
                        };

                        await sendMail(emailOptions);
                    }

                    await DiscordAPI.createFeedback(feedback);
                    return feedback;
                }
            }
        },
        result: {
            // Extension of result allows us to modify result of a fetch query
            course: {
                // Modify course result
                flags: {
                    needs: { flags: true },
                    compute(course) {
                        return FlagDecoder.course(course.flags); // Overwrite flag field with computed flags
                    },
                },
                secondaryColor: {
                    // Compute secondaryColor
                    needs: { color: true },
                    compute(course) {
                        if (!course.color) return;
                        const color = course.color;
                        const decimal = 1.25;

                        let r = parseInt(color.substring(1, 3), 16);
                        let g = parseInt(color.substring(3, 5), 16);
                        let b = parseInt(color.substring(5, 7), 16);

                        r = Math.round(r / decimal);
                        g = Math.round(g / decimal);
                        b = Math.round(b / decimal);

                        r = r < 255 ? r : 255;
                        g = g < 255 ? g : 255;
                        b = b < 255 ? b : 255;

                        const rr = r.toString(16).length === 1 ? `0${r.toString(16)}` : r.toString(16);
                        const gg = g.toString(16).length === 1 ? `0${g.toString(16)}` : g.toString(16);
                        const bb = b.toString(16).length === 1 ? `0${b.toString(16)}` : b.toString(16);

                        return `#${rr}${gg}${bb}`;
                    },
                },
                stats: {
                    needs: { stats: true },
                    compute(course) {
                        const stats = CourseStats.parse(course.stats);
                        const accuracy = calcAccuracy(stats.submissions, stats.submissionsCorrect);
                        const difficulty = calcDifficulty(stats.submissions, stats.submissionsCorrect);
                        return {
                            ...stats,
                            accuracy: accuracy,
                            difficulty: difficulty
                        };
                    },
                },
            },
            exam: {
                // Modify exam query
                flags: {
                    needs: { flags: true },
                    compute(exam) {
                        return FlagDecoder.exam(exam.flags); // Overwrite flag field with computed flags
                    },
                },
                stats: {
                    needs: { stats: true },
                    compute(exam) {
                        const stats = ExamStats.parse(exam.stats);
                        const accuracy = calcAccuracy(stats.submissions, stats.submissionsCorrect);
                        const difficulty = calcDifficulty(stats.submissions, stats.submissionsCorrect);
                        return {
                            ...stats,
                            accuracy: accuracy,
                            difficulty: difficulty
                        };
                    },
                },
            },
            question: {
                // Modify question query
                flags: {
                    needs: { flags: true },
                    compute(question) {
                        return FlagDecoder.question(question.flags); // Overwrite flag field with computed flags
                    },
                },
                stats: {
                    needs: { stats: true },
                    compute(question) {
                        const stats = QuestionStats.parse(question.stats);
                        const accuracy = calcAccuracy(stats.submissions, stats.submissionsCorrect);
                        const difficulty = calcDifficulty(stats.submissions, stats.submissionsCorrect);
                        return {
                            ...stats,
                            accuracy: accuracy,
                            difficulty: difficulty
                        };
                    },
                },
            },
            topic: {
                stats: {
                    needs: { stats: true },
                    compute(topic) {
                        const stats = TopicStats.parse(topic.stats);
                        const accuracy = calcAccuracy(stats.submissions, stats.submissionsCorrect);
                        const difficulty = calcDifficulty(stats.submissions, stats.submissionsCorrect);
                        return {
                            ...stats,
                            accuracy: accuracy,
                            difficulty: difficulty
                        };
                    },
                },
            },
            answerChoice: {
                stats: {
                    needs: { stats: true },
                    compute(answerChoice) {
                        return AnswerChoiceStats.parse(answerChoice.stats);
                    },
                },
            },
        },
    });

function calcAccuracy(submissions: number, submissionsCorrect: number) {
    return submissionsCorrect / Math.max(submissions, 1);
}

function calcDifficulty(submissions: number, submissionsCorrect: number) {
    const baselineSubmissions = submissions + 100;
    const baselineSubmissionsCorrect = submissionsCorrect + 50;
    return 1.25 - (baselineSubmissionsCorrect / baselineSubmissions);
}