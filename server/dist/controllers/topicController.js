var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PrismaClient } from '@prisma/client';
import { APIError, NotFoundError } from "../middleware/errors/index.js";
const prisma = new PrismaClient();
const createTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const { name } = req.body;
    if (typeof name === "string" && name.length > 50) {
        throw new APIError("Topic length must be under 50 characters", 400);
    }
    const topic = yield prisma.topic.create({
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
    });
    res.status(200).send(topic);
});
const updateTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { topicId } = req.params;
    const { name } = req.body;
    if (typeof name === "string" && name.length > 50) {
        throw new APIError("Topic length must be under 50 characters", 400);
    }
    const existingTopic = yield prisma.topic.findUnique({
        where: {
            name: name
        }
    });
    let result;
    if (existingTopic) {
        const originalTopic = yield prisma.topic.findUnique({
            where: {
                id: topicId
            },
            include: {
                questions: true
            }
        });
        if (!originalTopic) {
            throw new NotFoundError("Invalid topic id");
        }
        result = yield prisma.topic.update({
            where: {
                name: name
            },
            data: {
                questions: {
                    connect: originalTopic.questions.map((question) => ({ id: question.id }))
                }
            }
        });
        yield prisma.topic.delete({
            where: {
                id: topicId
            }
        });
    }
    else {
        result = yield prisma.topic.update({
            where: {
                id: topicId
            },
            data: {
                name: name
            }
        });
    }
    res.status(200).send(result);
});
const deleteTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { topicId } = req.params;
    const topic = yield prisma.topic.delete({
        where: {
            id: topicId
        }
    });
    if (!topic) {
        throw new NotFoundError("Topic not found");
    }
    res.status(200).send(topic);
});
export { createTopic, updateTopic, deleteTopic };
//# sourceMappingURL=topicController.js.map