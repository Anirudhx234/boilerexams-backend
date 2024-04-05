import prisma from "../prisma/prisma.js";
import type { Request, Response } from "express";
import { APIError, NotFoundError } from "../middleware/errors/index.js";
import Resolver from "../helpers/resolver.js";
import {
    CreateQuestionScheme,
    UpdateQuestionScheme,
    CreateSubmissionScheme,
    UpdateSubmissionScheme
} from "../prisma/schema.js";
import { object, z } from "zod";
import FlagEncoder from "../helpers/encoder.js";
import Formatter from "../helpers/formatter.js";

export const QuestionFlags = z.object({
    published:              z.boolean().default(false),
    disableRandomAnswers:   z.boolean().default(true),
    answersStartHidden:     z.boolean().default(true)
});

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

    if (!(question.exam.flags as any).published) {
        throw new APIError("Exam must be published", 409);
    }

    const status = !(question.flags as any).published;

    await prisma.question.update({
        where: {
            id: question.id,
        },
        data: {
            flags: FlagEncoder.question({
                ...(question.flags as any),
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

export async function createSubmission(req: Request, res: Response) {
    const { q, t, e, c } = req.params;
    const options = CreateSubmissionScheme.parse(req.body);

    const question = await prisma.question.findUnique({
        where: await Resolver.question(q, t, e, c)
    });

    if (!question) {
        throw new NotFoundError(`Question not found: ${q}`);
    }

    const submission = await prisma.submission.create({
        data: {
            ...options,
        },
        include: {
            question: true
        }
    });
    res.status(200).send(submission);
}

export async function batchCreateSubmission(req: Request, res: Response) {
    const options: z.infer<typeof CreateSubmissionScheme>[] = req.body.map((option: unknown) => {
        return CreateSubmissionScheme.parse(option);
    });

    const submissions = await prisma.$transaction(
        options.map((option) => {
                return prisma.submission.create({
                    data: {
                        ...option,
                    },
                });
            },
        ),
    );

    res.status(200).send(submissions);
}

export async function updateSubmission(req: Request, res: Response) {
    const { submissionId } = req.params;
    const options = UpdateSubmissionScheme.parse(req.body);

    const submission = await prisma.submission.update({
        where: {
            id: submissionId,
        },
        data: {
            ...options
        },
    });

    res.status(200).send(submission);
}
