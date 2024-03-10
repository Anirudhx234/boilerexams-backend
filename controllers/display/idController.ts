import prisma from "../../libs/prisma.js";
import { Request, Response } from "express";
import { NotFoundError } from "../../middleware/errors/index.js";

const getCourse = async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
        },
        include: {
            topics: true,
            exams: true
        },
    });

    if (!course) {
        throw new NotFoundError("Course not found");
    }
    return res.status(200).send(course);
};

const getCourseTopics = async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
        },
        select: {
            topics: true,
        },
    });
    if (!course) {
        throw new NotFoundError("Course not found");
    }
    return res.status(200).send(course.topics);
};

const getExam = async (req: Request, res: Response) => {
    const { examId } = req.params;
    const exam = await prisma.exam.findUnique({
        where: {
            id: examId,
        },
        include: {
            questions: {
                orderBy: {
                    number: "asc",
                },
                include: {
                    topics: true,
                    resources: true,
                },
            }
        },
    });

    if (!exam) {
        throw new NotFoundError("Exam not found");
    }
    return res.status(200).send(exam);
};

const getExamQuestions = async (req: Request, res: Response) => {
    const { examId } = req.params;
    const exam = await prisma.exam.findUnique({
        where: {
            id: examId,
        },
        select: {
            questions: {
                orderBy: {
                    number: "asc",
                },
            },
        },
    });

    if (!exam) {
        throw new NotFoundError("Exam not found");
    }
    return res.status(200).send(exam.questions);
};

const getCourseTopicQuestions = async (req: Request, res: Response) => {
    const { topicId } = req.params;

    const topic = await prisma.topic.findUnique({
        where: {
            id: topicId,
        },
        select: {
            questions: {
                include: {
                    question: true
                }
            },
        },
    });

    if (!topic) {
        throw new NotFoundError("Topic not found");
    }

    return res.status(200).send(topic.questions.map(relation => relation.question));
};

export { getCourse, getCourseTopics, getExam, getExamQuestions, getCourseTopicQuestions };
