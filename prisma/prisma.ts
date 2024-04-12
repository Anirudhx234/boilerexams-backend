import { AnswerChoiceStats, CourseStats, ExamStats, QuestionStats, TopicStats } from "../controllers/statsController.js";
import { deleteFileFromS3 } from "../utils/uploadFileToS3.js";
import { PrismaClient } from "@prisma/client";
import { UrlResourceData } from "../controllers/resourceController.js";
import FlagDecoder from "../helpers/decoder.js";
import Color from "color";

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
                        const color = Color(course.color);

                        if (color.isLight()) {
                            return color.darken(0.5).hex();
                        } else {
                            return color.lighten(0.5).hex();
                        }
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
