import { PrismaClient } from "@prisma/client";
import FlagDecoder from "../helpers/decoder.js";
import { UrlResourceData } from "../controllers/resourceController.js";
import { deleteFileFromS3 } from "../utils/uploadFileToS3.js";
import { AnswerChoiceStats, CourseStats, ExamStats, QuestionStats, TopicStats } from "../controllers/statsController.js";

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
                },
            },
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

                        const color = course.color.slice(1);

                        const r = parseInt(color.substring(0, 2), 16);
                        const g = parseInt(color.substring(2, 4), 16);
                        const b = parseInt(color.substring(4, 6), 16);

                        const lightnessFactor = 30; // Increase this value for lighter colors
                        const newR = Math.min(255, r + lightnessFactor);
                        const newG = Math.min(255, g + lightnessFactor);
                        const newB = Math.min(255, b + lightnessFactor);

                        // Convert back to hex
                        return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
                    },
                },
                stats: {
                    needs: { stats: true },
                    compute(course) {
                        return CourseStats.parse(course.stats ?? {});
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
                        return ExamStats.parse(exam.stats ?? {});
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
                        return QuestionStats.parse(question.stats ?? {});
                    },
                },
            },
            topic: {
                stats: {
                    needs: { stats: true },
                    compute(topic) {
                        return TopicStats.parse(topic.stats ?? {});
                    },
                },
            },
            answerChoice: {
                stats: {
                    needs: { stats: true },
                    compute(answerChoice) {
                        return AnswerChoiceStats.parse(answerChoice.stats ?? {});
                    },
                },
            },
        },
    });
