import { APIError, NotFoundError } from "../middleware/errors/index.js";
import type { Request, Response } from "express";
import { ReorderQuestions} from "../prisma/schema.js";
import { z } from "zod";
import Formatter from "../helpers/formatter.js";
import Resolver from "../helpers/resolver.js";
import prisma from "../prisma/prisma.js";
import { FullQuestion, PartialQuestion } from "./questionController.js";
import { randomUUID } from "node:crypto";

export const UpsertTopic = z.object({
    id:     z.string().uuid().default(randomUUID),
    name:   z.string().max(50, "Topic name must be <= 50 characters"),
});

export async function getAllTopics(req: Request, res: Response) {
    const topics = await prisma.topic.findMany({
        include: {
            questions: {
                include: {
                    question: true
                },
                orderBy: {
                    number: "asc"
                },
            },
        },
    });

    res.status(200).send(Formatter.topics({
        data: topics,
        sendUnpublished: req.sendUnpublished
    }));
}

export async function getTopic(req: Request, res: Response) {
    const { t, c } = req.params;

    const topic = await prisma.topic.findUniqueOrThrow({
        where: await Resolver.topic(t, c),
        include: {
            questions: {
                include: {
                    question: {
                        select: PartialQuestion
                    }
                }
            }
        },
    });

    res.status(200).send(Formatter.topic({
        data: topic,
        sendUnpublished: req.sendUnpublished
    }));
}

export async function getTopicQuestions(req: Request, res: Response) {
    const { t, c } = req.params;

    const topic = await prisma.topic.findUniqueOrThrow({
        where: await Resolver.topic(t, c)
    });

    const relations = await prisma.questionToTopic.findMany({
        where: {
            topicId: topic.id
        },
        include: {
            question: {
                include: FullQuestion
            }
        },
        orderBy: {
            number: "asc"
        }
    });

    const formattedQuestionToTopics = Formatter.questionsToTopics({
        data: relations,
        sendUnpublished: req.sendUnpublished
    });

    res.status(200).send(formattedQuestionToTopics?.map(relation => relation.question));
}

export async function createTopic(req: Request, res: Response) {
    const { c } = req.params;
    const options = UpsertTopic.parse(req.body);

    const course = await prisma.course.findUnique({
        where: Resolver.course(c)
    });

    if (!course) throw new APIError(`Course not found`, 404);

    const topic = await prisma.topic.create({
        data: {
            ...options,
            courseId: course.id
        },
        include: {
            questions: {
                include: {
                    question: true
                }
            }
        },
    });

    res.status(200).send({
        ...topic,
        questions: topic.questions.map(relation => relation.question)
    });
}

export async function updateTopic(req: Request, res: Response) {
    const { t, c } = req.params;
    const options = UpsertTopic.parse(req.body);

    const topic = await prisma.topic.update({
        where: await Resolver.topic(t, c),
        data: {
            ...options
        }
    });

    res.status(200).send(topic);
}

export async function reorderTopicQuestions(req: Request, res: Response) {
    const { t, c } = req.params;

    const topic = await prisma.topic.findUnique({
        where: await Resolver.topic(t, c),
        select: {
            id: true,
            questions: true
        }
    });

    if (!topic) {
        throw new NotFoundError(`Topic not found: ${t} ${c}`);
    }

    const options = ReorderQuestions.parse(req.body);

    const questions = await prisma.$transaction(topic.questions.map(relation => {
        return prisma.questionToTopic.update({
            where: {
                questionId_topicId: {
                    questionId: relation.questionId,
                    topicId: relation.topicId
                }
            },
            data: {
                number: options.indexOf(relation.questionId) + 1
            }
        });
    }));

    res.status(200).send(questions);
}

export async function setTopicQuestions(req: Request, res: Response) {
    const { topicId } = req.params;
    const { questionIds } = req.body;

    const topic = await prisma.topic.update({
        where: {
            id: topicId,
        },
        data: {
            questions: {
                set: questionIds.map((id: string) => ({ id: id })),
            },
        },
    });

    res.status(200).send(topic);
}

export async function deleteTopic(req: Request, res: Response) {
    const { topicId } = req.params;

    const topic = await prisma.topic.delete({
        where: {
            id: topicId,
        },
    });

    if (!topic) {
        throw new NotFoundError("Topic not found");
    }

    res.status(200).send(topic);
}