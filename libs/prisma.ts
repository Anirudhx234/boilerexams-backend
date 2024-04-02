import {PrismaClient, QuestionType, ResourceType, type Submission} from "@prisma/client";
import FlagDecoder from "../helpers/decoder.js";
import uploadFileToS3 from "../utils/uploadFileToS3.js";
import { Epoch, UrlResourceData } from "../prisma/schema.js";
import { courseStats } from "../helpers/stats/courseStats.ts";
import { examStats } from "../helpers/stats/examStats.ts";
import { questionStats } from "../helpers/stats/questionStats.ts";
import { submissionStats } from "../helpers/stats/submissionStats.ts";

const prisma = new PrismaClient();

export default prisma
    .$extends({
        query: {
            resource: {
                // Hook into resource create query
                async create({ query, args}) {
                    if (args.data.type == ResourceType.IMAGE) {
                        // ToDo Test if this works

                        const file = args.data.data as any;
                        const { Location, Key} = await uploadFileToS3(file.buffer, file.mimetype);
                        args.data.data = {
                            url: Location,
                            key: Key
                        };
                        args.data.type = ResourceType.IMAGE;
                    }

                    return query(args);
                },
                // Hook into resource delete query
                async delete({ query, args }) {
                    const resource = await query(args);

                    if (resource.type == ResourceType.IMAGE) {
                        const result = UrlResourceData.safeParse(resource.data);

                        if (result.success) {
                            if (result.data.key) {
                                // ToDo Delete file from S3
                            }
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
                }
            },
            exam: { // Modify exam query
                flags: {
                    needs: { flags : true },
                    compute(exam) {
                        return FlagDecoder.exam(exam.flags); // Overwrite flag field with computed flags
                    }
                }
            },
            question: { // Modify question query
                stats: {
                    needs: { id: true, type: true, data: true },
                    async compute(question) {
                        if (question.type != QuestionType.MULTIPLE_CHOICE) return;

                        const submissions = await prisma.submission.findMany({
                            where: {
                                questionId: question.id
                            }
                        });

                        const totalSubmissions = submissions.length;
                        const totalCorrectSubmissions = submissions.reduce((count: number, submission: Submission) => {
                            return submission.correct ? count + 1 : count;
                        }, 0);
                        const timeSpent = submissions.reduce((count: bigint, submission: Submission) => {
                            if (submission.timeSpent < 0n) return count;
                            return count + submission.timeSpent;
                        }, 0n);
                        const timeSpentVideo = submissions.reduce((count: bigint, submission: Submission) => {
                            if (submission.timeSpentVideo < 0n) return count;
                            return count + submission.timeSpentVideo;
                        }, 0n);
                        const timeSpentModal = submissions.reduce((count: bigint, submission: Submission) => {
                            if (submission.timeSpentModal < 0n) return count;
                            return count + submission.timeSpentModal;
                        }, 0n);

                        return {
                            totalSubmissions: totalSubmissions,
                            totalCorrectSubmissions: totalCorrectSubmissions,
                            timeSpent: timeSpent,
                            timeSpentVideo: timeSpentVideo,
                            timeSpentModal: timeSpentModal
                        };
                    }
                },
                flags: {
                    needs: { flags: true },
                    compute(question) {
                        return FlagDecoder.question(question.flags); // Overwrite flag field with computed flags
                    }
                }
            },
            answerChoice: {
                stats: {
                    needs: {  id: true, questionId: true, index: true },
                    async compute(answerChoice) {
                        return prisma.submission.count({
                            where: {
                                questionId: answerChoice.questionId,
                                userSolution: {
                                    array_contains: answerChoice.index
                                }
                            }
                        });
                    }
                }
            }
        }
    })
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
    });