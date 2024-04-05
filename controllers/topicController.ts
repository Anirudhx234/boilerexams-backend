import prisma from "../prisma/prisma.js";
import type { Request, Response } from "express";
import { APIError, NotFoundError } from "../middleware/errors/index.js";
import Resolver from "../helpers/resolver.js";
import { ReorderQuestions} from "../prisma/schema.js";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import Formatter from "../helpers/formatter.js";

export const CreateTopic = z.object({
    id:     z.string().uuid().default(randomUUID),
    name:   z.string().max(50, "Topic name must be <= 50 characters"),
});

export const UpdateTopic= CreateTopic.extend({
    id: z.string().uuid(),
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

    res.status(200).send(await Formatter.topics({
        data: topics,
        sendUnpublished: req.sendUnpublished,
        computeStats: true
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
                        select: {
                            id: true,
                            number: true,
                            flags: true,
                            exam: true
                        }
                    }
                },
            }
        },
    });

    res.status(200).send(await Formatter.topic({
        data: topic,
        sendUnpublished: req.sendUnpublished,
        computeStats: true
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
                include: {
                    resources: true,
                    explanation: true,
                    children: {
                        include: {
                            resources: true,
                            answerChoices: {
                                include: {
                                    resources: true
                                }
                            }
                        }
                    },
                    topics: {
                        include: {
                            topic: true
                        }
                    },
                    answerChoices: {
                        include: {
                            resources: true
                        }
                    }
                }
            }
        }
    });

    const formattedQuestionToTopics = await Formatter.questionsToTopics({
        data: relations,
        sendUnpublished: req.sendUnpublished,
        computeStats: true
    });

    res.status(200).send(formattedQuestionToTopics?.map(relation => relation.question));
}

export async function createTopic(req: Request, res: Response) {
    const { c } = req.params;
    const options = CreateTopic.parse(req.body);

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
    const options = UpdateTopic.parse(req.body);

    const topic = await prisma.topic.update({
        where: await Resolver.topic(t, c),
        data: {
            ...options
        }
    });

    res.status(200).send(topic);
}

export async function reorderQuestions(req: Request, res: Response) {
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