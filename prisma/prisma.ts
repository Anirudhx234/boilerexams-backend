import { PrismaClient, ResourceType } from "@prisma/client";
import FlagDecoder from "../helpers/decoder.js";
import uploadFileToS3 from "../utils/uploadFileToS3.js";
import { Epoch, UrlResourceData } from "../prisma/schema.js";
import { courseStats } from "../helpers/stats/courseStats.js";
import { examStats } from "../helpers/stats/examStats.js";
import { questionStats } from "../helpers/stats/questionStats.js";
import { submissionStats } from "../helpers/stats/submissionStats.js";

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
                },
                stats: {
                    needs: { id: true },
                    async compute(course) {
                        return courseStats(new Date(), Epoch, course.id);
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
                        return courseStats(new Date(), Epoch, exam.id);
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
                        return courseStats(new Date(), Epoch, question.id);
                    }
                }
            },
            answerChoice: {
                stats: {
                    needs: { id: true, questionId: true, index: true },
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