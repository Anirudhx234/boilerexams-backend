import { PrismaClient } from "@prisma/client";
import FlagDecoder from "../helpers/decoder.js";
import { Epoch } from "./schema.js";
import { courseStats } from "../helpers/stats/courseStats.js";
import { examStats } from "../helpers/stats/examStats.js";
import { questionStats } from "../helpers/stats/questionStats.js";
import { submissionStats } from "../helpers/stats/submissionStats.js";
import { UrlResourceData } from "../controllers/resourceController.js";
import { deleteFileFromS3 } from "../utils/uploadFileToS3.js";
import { answerChoiceStats } from "../helpers/stats/answerChoiceStats.js";

const prisma = new PrismaClient();

export default prisma
    .$extends({
        model: {
            course: {
                async stats(data: { before?: Date, after?: Date }) {
                    const before = data.before ?? new Date();
                    const after = data.after ?? Epoch;
                    return courseStats(before, after);
                }
            },
            exam: {
                async stats(data: { before?: Date, after?: Date }) {
                    const before = data.before ?? new Date();
                    const after = data.after ?? Epoch;
                    return examStats(before, after);
                }
            },
            question: {
                async stats(data: { before?: Date, after?: Date }) {
                    const before = data.before ?? new Date();
                    const after = data.after ?? Epoch;
                    return questionStats(before, after);
                }
            },
            submission: {
                async stats(data: { before?: Date, after?: Date }) {
                    const before = data.before ?? new Date();
                    const after = data.after ?? Epoch;
                    return submissionStats(before, after);
                }
            }
        },
    })
    .$extends({
        query: {
            resource: {
                async update({ query, args }) {
                    const oldResource = await prisma.resource.findUniqueOrThrow({
                        where: {
                            id: args.where.id
                        }
                    });
                    const newResource = await query(args);

                    const oldResult = UrlResourceData.safeParse(oldResource.data);
                    const newResult = UrlResourceData.safeParse(newResource.data);

                    if (oldResult.success && newResult.success) {
                        const oldData = oldResult.data;
                        const newData = newResult.data;

                        if (oldData.key != newData.key) {
                            if (oldData.key) {
                                // ToDo Check if this works
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
                            // ToDo Check if this works
                            await deleteFileFromS3(result.data.key);
                        }
                    }

                    return resource;
                }
            },
        },
        result: { // Extension of result allows us to modify result of a fetch query
            course: { // Modify course result
                flags: {
                    needs: { flags : true },
                    compute(course) {
                        return FlagDecoder.course(course.flags); // Overwrite flag field with computed flags
                    }
                },
                stats: {
                    needs: { id: true },
                    async compute(course) {
                        const stats = await courseStats(new Date(), Epoch, course.id);
                        return stats[0] ?? {
                            questions: "0",
                            exams: "0",
                            timeSpent: "0",
                            timeSpentVideo: "0",
                            submissions: "0",
                            submissionsCorrect: "0"
                        };
                    }
                }
            },
            exam: { // Modify exam query
                flags: {
                    needs: { flags : true },
                    compute(exam) {
                        return FlagDecoder.exam(exam.flags); // Overwrite flag field with computed flags
                    }
                },
                stats: {
                    needs: { id: true },
                    async compute(exam) {
                        const stats = await examStats(new Date(), Epoch, exam.id);
                        return stats[0] ?? {
                            questions: "0",
                            timeSpent: "0",
                            timeSpentVideo: "0",
                            submissions: "0",
                            submissionsCorrect: "0"
                        };
                    }
                }
            },
            question: { // Modify question query
                flags: {
                    needs: { flags: true },
                    compute(question) {
                        return FlagDecoder.question(question.flags); // Overwrite flag field with computed flags
                    }
                },
                stats: {
                    needs: { id: true },
                    async compute(question) {
                        const stats = await questionStats(new Date(), Epoch, question.id);
                        return stats[0] ?? {
                            timeSpent: "0",
                            timeSpentVideo: "0",
                            submissions: "0",
                            submissionsCorrect: "0"
                        };
                    }
                }
            },
            answerChoice: {
                stats: {
                    needs: { questionId: true, index: true },
                    async compute(answerChoice) {
                        return answerChoiceStats(answerChoice.questionId, answerChoice.index);
                    }
                }
            }
        }
    })
