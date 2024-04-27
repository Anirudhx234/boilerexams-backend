import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import prisma from "../prisma/prisma.js";
import { ReorderQuestions } from "../prisma/schema.js";
import Formatter from "../helpers/formatter.js";
import Resolver from "../helpers/resolver.js";
import APIError from "../middleware/errors/APIError.js";
import { FullQuestion, PartialQuestion } from "./questionController.js";

export const UpsertTopic = z.object({
    id: z.string().uuid().default(randomUUID),
    name: z.string().max(50, "Topic name must be <= 50 characters"),
    examNumbers: z.array(z.number().int()).optional()
});

export const SetTopicQuestionsOptions = z.array(z.string().uuid());

export async function getAllTopics(req: Request, res: Response) {
    const topics = await prisma.topic.findMany({
        include: {
            questions: {
                include: {
                    question: true
                },
                orderBy: {
                    number: "asc"
                }
            }
        }
    });

    res.status(200).send(
        Formatter.topics({
            data: topics,
            sendUnpublished: req.sendUnpublished
        })
    );
}

export async function getTopic(req: Request, res: Response) {
    req.params.topic = req.params["0"];

    const topic = await prisma.topic.findUniqueOrThrow({
        where: await Resolver.topic(req.params),
        include: {
            questions: {
                include: {
                    question: {
                        select: PartialQuestion
                    }
                }
            }
        }
    });

    res.status(200).send(
        Formatter.topic({
            data: topic,
            sendUnpublished: req.sendUnpublished
        })
    );
}

export async function getTopicQuestions(req: Request, res: Response) {
    req.params.topic = req.params["0"];

    const topic = await prisma.topic.findUniqueOrThrow({
        where: await Resolver.topic(req.params)
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

    res.status(200).send(formattedQuestionToTopics?.map((relation) => relation.question));
}

export async function createTopic(req: Request, res: Response) {
    const options = UpsertTopic.parse(req.body);

    const course = await prisma.course.findUnique({
        where: Resolver.course(req.params)
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
        }
    });

    res.status(200).send({
        ...topic,
        questions: topic.questions.map((relation) => relation.question)
    });
}

export async function updateTopic(req: Request, res: Response) {
    req.params.topic = req.params["0"];
    const options = UpsertTopic.parse(req.body);

    const topic = await prisma.topic.update({
        where: await Resolver.topic(req.params),
        data: {
            ...options
        }
    });

    res.status(200).send(topic);
}

export async function reorderTopicQuestions(req: Request, res: Response) {
    req.params.topic = req.params["0"];

    const topic = await prisma.topic.findUniqueOrThrow({
        where: await Resolver.topic(req.params),
        select: {
            id: true,
            questions: true
        }
    });

    const options = ReorderQuestions.parse(req.body);

    const questions = await prisma.$transaction(
        topic.questions.map((relation) => {
            return prisma.questionToTopic.update({
                where: {
                    questionId_topicId: {
                        questionId: relation.questionId,
                        topicId: relation.topicId
                    }
                },
                data: {
                    number: options.indexOf(relation.questionId) + 1
                },
                select: PartialQuestion
            });
        })
    );

    res.status(200).send(questions);
}

export async function setTopicQuestions(req: Request, res: Response) {
    req.params.topic = req.params["0"];
    const options = SetTopicQuestionsOptions.parse(req.body);

    const topic = await prisma.topic.findUniqueOrThrow({
        where: await Resolver.topic(req.params)
    });

    const updatedTopic = await prisma.topic.update({
        where: {
            id: topic.id
        },
        data: {
            questions: {
                set: options.map((questionId) => {
                    return {
                        questionId_topicId: {
                            questionId: questionId,
                            topicId: topic.id
                        }
                    };
                })
            }
        },
        include: {
            questions: {
                include: {
                    question: true
                }
            }
        }
    });

    res.status(200).send(
        Formatter.topic({
            data: updatedTopic,
            sendUnpublished: req.sendUnpublished
        })
    );
}

export async function deleteTopic(req: Request, res: Response) {
    req.params.topic = req.params["0"];

    const topic = await prisma.topic.delete({
        where: await Resolver.topic(req.params)
    });

    if (!topic) {
        throw new APIError("Topic not found", 404);
    }

    res.status(200).send(topic);
}

export function upsertOrDisconnectTopics(
    questionId: string,
    courseId: string,
    currentTopicIds: string[],
    topics?: z.infer<typeof UpsertTopic>[]
) {
    const newTopicIds = topics?.map((topic) => topic.id);

    return {
        upsert: topics?.map((topic) => {
            return {
                where: {
                    questionId_topicId: {
                        questionId: questionId,
                        topicId: topic.id
                    }
                },
                update: {},
                create: {
                    topic: {
                        connectOrCreate: {
                            where: {
                                id: topic.id
                            },
                            create: {
                                name: topic.name,
                                courseId: courseId,
                                examNumbers: topic.examNumbers
                            }
                        }
                    }
                }
            };
        }),
        deleteMany: currentTopicIds
            .filter((id) => !newTopicIds?.includes(id))
            .map((id) => {
                return {
                    topicId: id
                };
            })
    };
}
