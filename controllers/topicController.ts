import prisma from "../libs/prisma.js";
import { Request, Response } from "express";
import { APIError, NotFoundError } from "../middleware/errors/index.js";
import Resolver from "../helpers/resolver.js";
import { CreateTopicScheme, ReorderQuestions, UpdateTopicScheme } from "../prisma/schema.js";

export async function createTopic(req: Request, res: Response) {
    const { courseResolvable } = req.params;
    const options = CreateTopicScheme.parse(req.body);

    const course = await prisma.course.findUnique({
        where: Resolver.course(courseResolvable)
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
    const { topicResolvable, courseResolvable } = req.params;
    const options = UpdateTopicScheme.parse(req.body);

    const topic = await prisma.topic.update({
        where: await Resolver.topic(topicResolvable, courseResolvable),
        data: {
            ...options
        }
    });

    res.status(200).send(topic);
}

export async function reorderQuestions(req: Request, res: Response) {
    const { topicResolvable, courseResolvable } = req.params;

    const topic = await prisma.topic.findUnique({
        where: await Resolver.topic(topicResolvable, courseResolvable),
        select: {
            id: true,
            questions: true
        }
    });

    if (!topic) {
        throw new NotFoundError(`Topic not found: ${topicResolvable} ${courseResolvable}`);
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