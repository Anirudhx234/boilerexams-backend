import { PrismaClient } from '@prisma/client';
import { NotFoundError } from "../middleware/errors";

const prisma = new PrismaClient();

const createTopic = async (req, res) => {
    const { courseId } = req.params
    const { name } = req.body
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

const updateTopic = async (req, res) => {
    const { topicId } = req.params
    const topic = await prisma.topic.update({
        where: {
            id: topicId
        },
        data: req.body
    })
    res.status(200).send(topic)
}

const deleteTopic = async (req, res) => {
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