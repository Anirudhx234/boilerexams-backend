import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express'
import { APIError, NotFoundError } from "../middleware/errors/index.js";

const prisma = new PrismaClient();

const createTopic = async (req: Request, res: Response) => {
    const { courseId } = req.params
    const { name } = req.body

    if (typeof name === "string" && name.length > 50) {
        throw new APIError("Topic length must be under 50 characters", 400);
    }

    const topic = await prisma.topic.create({
        data: {
            name: name,
            courses: {
                connect: { id: courseId }
            }
        },
        include: {
            courses: true,
            questions: true
        }
    })
    res.status(200).send(topic)
}

const updateTopic = async (req: Request, res: Response) => {
    const { topicId } = req.params
    const { name } = req.body

    if (typeof name === "string" && name.length > 50) {
        throw new APIError("Topic length must be under 50 characters", 400);
    }

    const existingTopic = await prisma.topic.findUnique({
        where: {
            name: name
        }
    })

    let result;
    if (existingTopic) {
        const originalTopic = await prisma.topic.findUnique({
            where: {
                id: topicId
            },
            include: {
                questions: true
            }
        })
        if (!originalTopic) {
            throw new NotFoundError("Invalid topic id")
        }

        result = await prisma.topic.update({
            where: {
                name: name
            },
            data: {
                questions: {
                    connect: originalTopic.questions.map((question) => ({ id: question.id }))
                }
            }
        })

        await prisma.topic.delete({
            where: {
                id: topicId
            }
        })
    }
    else {
        result = await prisma.topic.update({
            where: {
                id: topicId
            },
            data: {
                name: name
            }
        })
    }
    res.status(200).send(result)
}

const deleteTopic = async (req: Request, res: Response) => {
    const { topicId } = req.params;
    const topic = await prisma.topic.delete({
        where: {
            id: topicId
        }
    })

    if (!topic) {
        throw new NotFoundError("Topic not found")
    }
    res.status(200).send(topic)
}

export {
    createTopic,
    updateTopic,
    deleteTopic
}