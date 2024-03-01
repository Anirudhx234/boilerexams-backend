import prisma from "../libs/prisma.js";
import { Request, Response } from "express";
import { APIError, NotFoundError } from "../middleware/errors/index.js";

const createTopic = async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const { name } = req.body;

    if (typeof name === "string" && name.length > 50) {
        throw new APIError("Topic length must be under 50 characters", 400);
    }

    const topic = await prisma.topic.create({
        data: {
            name: name,
            courseId: courseId
        },
        include: {
            questions: true,
        },
    });
    res.status(200).send(topic);
};

const updateTopic = async (req: Request, res: Response) => {
    const { topicId } = req.params;
    const { name } = req.body;

    if (typeof name === "string" && name.length > 50) {
        throw new APIError("Topic length must be under 50 characters", 400);
    }

    const topic = await prisma.topic.update({
        where: {
            id: topicId
        },
        data: {
            name: name
        }
    });

    res.status(200).send(topic);
};

const setTopicQuestions = async (req: Request, res: Response) => {
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
};

const deleteTopic = async (req: Request, res: Response) => {
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
};

export { createTopic, updateTopic, setTopicQuestions, deleteTopic };
