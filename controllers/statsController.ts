import { Request, Response } from "express";
import APIError from "../middleware/errors/APIError.js";
import { courseStats } from "../helpers/stats/courseStats.js";
import { examStats } from "../helpers/stats/examStats.js";
import { questionStats } from "../helpers/stats/questionStats.js";
import { topicStats } from "../helpers/stats/topicStats.js";
import { hourlySubmissionStats } from "../helpers/stats/submissionStats.js";
import { Epoch } from "../prisma/schema.js";
import { z } from "zod";
import prisma from "../prisma/prisma.js";
import Resolver from "../helpers/resolver.js";

export const AnswerChoiceStats = z
    .preprocess((stats) => {
        return stats ?? {
            count: 0
        };
    }, z.object({
        id: z.string().uuid().optional(),
        index: z.number().int().optional(),
        count: z.number().default(0),
    }));


export const SubmissionStats = z
    .preprocess((stats) => {
        return stats ?? {
            count: 0,
            timeSpent: 0n,
            timeSpentVideo: 0n
        };
    }, z.object({
        id: z.string().uuid().optional(),
        count: z.number().default(1),
        timeSpent: z.coerce.bigint().default(0n),
        timeSpentVideo: z.coerce.bigint().default(0n),
    }));

export const QuestionStats = z
    .preprocess((stats) => {
        return stats ?? {
            count: 0,
            submissions: 0,
            submissionsCorrect: 0,
            timeSpent: 0n,
            timeSpentVideo: 0n
        };
    }, SubmissionStats.innerType().extend({
        submissions: z.number().default(0),
        submissionsCorrect: z.number().default(0),
    }));

export const ExamStats = z
    .preprocess((stats) => {
        return stats ?? {
            count: 0,
            questions: 0,
            submissions: 0,
            submissionsCorrect: 0,
            timeSpent: 0n,
            timeSpentVideo: 0n
        };
    }, QuestionStats.innerType().extend({
        questions: z.number().default(0),
    }));

export const TopicStats = z
    .preprocess((stats) => {
        return stats ?? {
            count: 0,
            questions: 0,
            submissions: 0,
            submissionsCorrect: 0,
            timeSpent: 0n,
            timeSpentVideo: 0n
        };
    }, QuestionStats.innerType().extend({
        questions: z.number().default(0),
    }));

export const CourseStats = z
    .preprocess((stats) => {
        return stats ?? {
            count: 0,
            exams: 0,
            topics: 0,
            questions: 0,
            submissions: 0,
            submissionsCorrect: 0,
            timeSpent: 0n,
            timeSpentVideo: 0n
        };
    }, ExamStats.innerType().extend({
        exams: z.number().default(0),
        topics: z.number().default(0)
}));

export const HourlyStats = z.object({
    x: z.number(),
    y: z.number(),
});

export async function generalStats(req: Request, res: Response) {
    const options = parseOptions(req);
    const stats = await courseStats(options);

    const combinedStats = stats?.reduce((a, b) => {
        return {
            count: a.count + b.count,
            exams: a.exams + b.exams,
            topics: a.topics + b.topics,
            questions: a.questions + b.questions,
            submissions: a.submissions + b.submissions,
            submissionsCorrect: a.submissionsCorrect + b.submissionsCorrect,
            timeSpent: a.timeSpent + b.timeSpent,
            timeSpentVideo: a.timeSpentVideo + b.timeSpentVideo,
        };
    });

    res.status(200).send({
        students: 10000,
        courses: combinedStats.count,
        exams: combinedStats.exams,
        topics: combinedStats.topics,
        questions: combinedStats.questions,
        submissions: combinedStats.submissions,
        submissionsCorrect: combinedStats.submissionsCorrect,
        timeSpent: combinedStats.timeSpent,
        timeSpentVideo: combinedStats.timeSpentVideo,
    });
}

export async function getCourseStats(req: Request, res: Response) {
    const options = parseOptions(req);

    const course = await getCourseSafe(req);
    const stats = await courseStats({ ...options, id: course?.id });

    res.status(200).json(formatStats(stats, options.sort, options.skip, options.limit));
}

export async function getExamStats(req: Request, res: Response) {
    const options = parseOptions(req);

    const exam = await getExamSafe(req);
    const course = await getCourseSafe(req);
    const stats = await examStats({ ...options, id: exam?.id, courseId: course?.id });

    res.status(200).json(formatStats(stats, options.sort, options.skip, options.limit));
}

export async function getTopicStats(req: Request, res: Response) {
    const options = parseOptions(req);

    const topic = await getTopicSafe(req);
    const course = await getCourseSafe(req);

    const stats = await topicStats({ ...options, id: topic?.id, courseId: course?.id });
    res.status(200).json(formatStats(stats, options.sort, options.skip, options.limit));
}

export async function getQuestionStats(req: Request, res: Response) {
    const options = parseOptions(req);

    const question = await getQuestionSafe(req);
    const topic = await getTopicSafe(req);
    const exam = await getExamSafe(req);
    const course = await getCourseSafe(req);

    const stats = await questionStats({
        ...options,
        id: question?.id,
        topicId: topic?.id,
        examId: exam?.id,
        courseId: course?.id,
    });

    res.status(200).json(formatStats(stats, options.sort, options.skip, options.limit));
}

export async function getHourlySubmissionStats(req: Request, res: Response) {
    const { before, after } = parseOptions(req);

    const course = await getCourseSafe(req);
    const stats = await hourlySubmissionStats(before, after, course?.id);

    res.status(200).json(stats);
}

function formatStats(stats: { submissions: number; submissionsCorrect: number }[], order: string, skip: number, limit?: number) {
    return stats
        .sort((a, b) => {
            const ratioA = a.submissions > 0 ? a.submissionsCorrect / a.submissions : 0;
            const ratioB = b.submissions > 0 ? b.submissionsCorrect / b.submissions : 0;
            if (order === "asc") {
                return ratioA - ratioB; // Sort in ascending order of ratios
            } else {
                return ratioB - ratioA; // Sort in descending order of ratios
            }
        })
        .slice(skip)
        .slice(0, limit);
}

function parseOptions(req: Request) {
    const now = new Date();
    const before = req.query.before ? new Date(Number.parseInt(<string>req.query.before)) : now;
    const after = req.query.after ? new Date(Number.parseInt(<string>req.query.before)) : Epoch;
    const sort = req.query.sort ? <string>req.query.sort : "asc";
    const limit = req.query.limit ? Number.parseInt(<string>req.query.limit) : undefined;
    const skip = req.query.skip ? Number.parseInt(<string>req.query.skip) : 0;

    if (sort != "asc" && sort != "desc") throw new APIError('Invalid Query Param Order must be "asc", "desc" or undefined', 400);

    return {
        before: before,
        after: after,
        sort: sort,
        limit: limit,
        skip: skip,
    };
}

async function getCourseSafe(req: Request) {
    try {
        return await prisma.course.findUniqueOrThrow({
            where: Resolver.course(req),
        });
    } catch {
        return undefined;
    }
}

async function getExamSafe(req: Request) {
    try {
        return await prisma.exam.findUniqueOrThrow({
            where: await Resolver.exam(req),
        });
    } catch {
        return undefined;
    }
}

async function getTopicSafe(req: Request) {
    try {
        return await prisma.topic.findUniqueOrThrow({
            where: await Resolver.topic(req),
        });
    } catch {
        return undefined;
    }
}

async function getQuestionSafe(req: Request) {
    try {
        return await prisma.question.findFirstOrThrow({
            where: await Resolver.question(req),
        });
    } catch {
        return undefined;
    }
}