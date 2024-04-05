import prisma from "../prisma/prisma.js";
import type { Request, Response } from "express";
import { APIError, NotFoundError } from "../middleware/errors/index.js";
import Resolver from "../helpers/resolver.js";
import { z } from "zod";
import FlagEncoder from "../helpers/encoder.js";
import Formatter from "../helpers/formatter.js";
import { QuestionType } from "@prisma/client";
import { CreateTopic, UpdateTopic } from "./topicController.js";

export const QuestionFlags = z.object({
    published:              z.boolean().default(false),
    disableRandomAnswers:   z.boolean().default(true),
    answersStartHidden:     z.boolean().default(true)
});

export const ParentQuestionData = z.object({
    body:           z.string().optional(),
    numberingType:  z.enum([ "LOWERCASE", "UPPERCASE", "ROMAN_LOWERCASE", "ROMAN_UPPERCASE", "NUMBER" ])
})

export const MultipleChoiceQuestionData = z.object({
    body:           z.string().optional(),
    solution:       z.array(z.number()),
});

export const FreeResponseQuestionData = z.object({
    body:       z.string().optional(),
    solution:   z.string().optional(),
});

export const ShortAnswerQuestionData = FreeResponseQuestionData;

export const FillInBlankQuestionData = FreeResponseQuestionData;

export const CreateQuestionScheme = z.object({
    type:       z.nativeEnum(QuestionType).default(QuestionType.MULTIPLE_CHOICE),
    data:       z.union([
        ParentQuestionData,
        MultipleChoiceQuestionData,
        ShortAnswerQuestionData,
        FillInBlankQuestionData,
        FreeResponseQuestionData
    ]),
    number:     z.number().min(1),
    courseId:   z.string().uuid().optional(),
    examId:     z.string().uuid().optional(),
    parentId:   z.string().uuid().optional(),
    flags:      QuestionFlags.optional().default({  }),
});

export const UpdateQuestionScheme = CreateQuestionScheme.extend({
    topics:     z.array(z.union([ CreateTopic, UpdateTopic ])),
});

export const QuestionData = z.union([
    MultipleChoiceQuestionData,
    FreeResponseQuestionData,
    ShortAnswerQuestionData,
    FillInBlankQuestionData
])

export async function createQuestion(req: Request, res: Response) {
    const { e, c } = req.params;

    const exam = await prisma.exam.findUnique({
        where: await Resolver.exam(e, c)
    });

    if (!exam) {
        throw new APIError("Exam not found", 404);
    }

    const options = CreateQuestionScheme.parse(req.body);

    const question = await prisma.question.create({
        data: {
            ...options,
            examId: exam.id,
            courseId: exam.courseId,
            flags: FlagEncoder.question(options.flags),
        }
    });

    res.status(200).send(await Formatter.question({
        data: question,
        sendUnpublished: req.sendUnpublished,
        computeStats: false
    }));
}

export async function getQuestion(req: Request, res: Response) {
    const { q, t, e, c } = req.params;

    const question = await prisma.question.findUniqueOrThrow({
        where: await Resolver.question(q, t, e, c),
        include: {
            course: true,
            exam: true,
            resources: true,
            explanation: {
                include: {
                    resources: true
                }
            },
            answerChoices: {
                include: {
                    resources: true
                }
            },
            topics: {
                include: {
                    topic: true
                }
            }
        },
    });

    if (!question.flags.published && !req.sendUnpublished) {
        throw new NotFoundError("Question not found");
    }

    res.status(200).send(await Formatter.question({
        data: question,
        sendUnpublished: req.sendUnpublished,
        computeStats: true
    }));
}

export async function updateQuestion(req: Request, res: Response) {
    const { q, t, e, c } = req.params;
    const options = UpdateQuestionScheme.parse(req.body);

    const question = await prisma.question.findUnique({
        where: await Resolver.question(q, t, e, c)
    });

    if (!question) throw new APIError(`Question not found: ${q}`, 404);

    const topicOptions = options.topics.map(topic => {
        return {
            where: { // Unique topic to question
                questionId_topicId: {
                    questionId: question.id,
                    topicId: topic.id
                }
            },
            create: { // Create a new QuestionToTopic relation
                topic: {
                    connectOrCreate: {
                        where: { // Connect to existing topic
                            id: topic.id,
                        },
                        create: { // Create new topic and connect
                            ...topic,
                            courseId: question.courseId
                        }
                    }
                }
            }
        };
    });

    /* ToDo Work on Resources
    const resourceOptions = options.resources.map(resource => {
        return {
            where: {
                id: resource.id
            },
            create: {
                ...resource
            }
        };
    });

     */

    const updatedQuestion = await prisma.question.update({
        where: {
            id: question.id
        },
        data: {
            ...options,
            flags: FlagEncoder.question(options.flags),
            topics: {
                connectOrCreate: {
                    ...topicOptions
                },
                deleteMany: {
                    topicId: {
                        notIn: options.topics.map(topic => topic.id)
                    }
                }
            },
            /* ToDo Work on Resources
            resources: {
                connectOrCreate: {
                    ...resourceOptions
                },
                deleteMany: {
                    id: {
                        notIn: options.resources.map(resource => resource.id)
                    }
                }
            },
            */
        },
        include: {
            topics: {
                include: {
                    topic: true
                }
            },
            resources: true,
        }
    });

    res.status(200).send(await Formatter.question({
        data: updatedQuestion,
        sendUnpublished: req.sendUnpublished,
        computeStats: false
    }));
}

export async function toggleQuestionPublished(req: Request, res: Response) {
    const { q, t, e, c } = req.params;

    // Need to hack since we can't force uniqueness on question numbers
    const question = await prisma.question.findUnique({
        where: await Resolver.question(q, t, e, c),
        select: {
            id: true,
            exam: {
                select: {
                    flags: true
                }
            },
            flags: true
        }
    });

    if (!question) {
        throw new NotFoundError("Question not found");
    }

    if (!question.exam.flags.published) {
        throw new APIError("Exam must be published", 409);
    }

    const status = !question.flags.published;

    await prisma.question.update({
        where: {
            id: question.id,
        },
        data: {
            flags: FlagEncoder.question({
                ...question.flags,
                published: status
            })
        },
    });

    res.status(200).send({
        message: `Question is now ${status ? "published" : "unpublished"}`,
    });
}

export async function deleteQuestion(req: Request, res: Response) {
    const { q, t, e, c } = req.params;

    // More hacks because question number is not unique
    const question = await prisma.question.delete({
        where: await Resolver.question(q, t, e, c),
    });

    if (!question) {
        throw new NotFoundError(`Question not found: ${q}`);
    }
    res.status(200).send(question);
}