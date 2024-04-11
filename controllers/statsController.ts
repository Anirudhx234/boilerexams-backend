import prisma from "../prisma/prisma.js";
import { Request, Response } from "express";
import Resolver from "../helpers/resolver.js";
import { Epoch } from "../prisma/schema.js";
import { z } from "zod";
import { courseStats } from "../helpers/stats/courseStats.js";
import { examStats } from "../helpers/stats/examStats.js";
import { questionStats } from "../helpers/stats/questionStats.js";
import { topicStats } from "../helpers/stats/topicStats.js";
import { hourlySubmissionStats } from "../helpers/stats/submissionStats.js";
import { APIError } from "../middleware/errors/index.js";
import { orderBy } from "lodash";

export const AnswerChoiceStats = z.object({
    id:     z.string().uuid().optional(),
    index:  z.number().int().optional(),
    count:  z.number().default(0),
});

export const SubmissionStats = z.object({
    id:             z.string().uuid().optional(),
    count:          z.number().default(1),
    timeSpent:      z.coerce.bigint().default(0n),
    timeSpentVideo: z.coerce.bigint().default(0n),
});

export const QuestionStats = SubmissionStats.extend({
    submissions:        z.number().default(0),
    submissionsCorrect: z.number().default(0),
});

export const ExamStats = QuestionStats.extend({
    questions:  z.number().default(0),
});

export const TopicStats = QuestionStats.extend({
    name:       z.string().optional(),
    questions:  z.number().default(0)
});

export const CourseStats = ExamStats.extend({
   exams:   z.number().default(0),
});

export const HourlyStats = z.object({
    x:  z.number(),
    y:  z.number(),
});

export async function generalStats(req: Request, res: Response) {
    const options = parseOptions(req);
    const stats = await courseStats(options);

    const combinedStats = stats?.reduce((a, b) => {
        return {
            count: a.count + b.count,
            exams: a.exams + b.exams,
            questions: a.questions + b.questions,
            submissions: a.submissions + b.submissions,
            submissionsCorrect: a.submissionsCorrect + b.submissionsCorrect,
            timeSpent: a.timeSpent + b.timeSpent,
            timeSpentVideo: a.timeSpentVideo + b.timeSpentVideo
        };
    });

    res.status(200).send({
        students:           10000,
        courses:            combinedStats.count,
        exams:              combinedStats.exams,
        questions:          combinedStats.questions,
        submissions:        combinedStats.submissions,
        submissionsCorrect: combinedStats.submissionsCorrect,
        timeSpent:          combinedStats.timeSpent,
        timeSpentVideo:     combinedStats.timeSpentVideo,
    });
}

export async function getCourseStats(req: Request, res: Response) {
    const { c } = req.params;
    const options = parseOptions(req);

    const course = c ? await prisma.course.findUniqueOrThrow({
        where: Resolver.course(c)
    }) : undefined;

    const stats = await courseStats({ ...options, id: course?.id });
    res.status(200).json(formatStats(stats, options.sort, options.skip, options.limit));
}

export async function getExamStats(req: Request, res: Response) {
    const { e, c } = req.params;
    const options = parseOptions(req);

    const exam = e ? await prisma.exam.findUniqueOrThrow({
        where: await Resolver.exam(e, c)
    }) : undefined;

    const course = c ? await prisma.course.findUniqueOrThrow({
        where: Resolver.course(c)
    }) : undefined;

    const stats = await examStats({ ...options, id: exam?.id, courseId: course?.id });

    res.status(200).json(formatStats(stats, options.sort, options.skip, options.limit));
}

export async function getTopicStats(req: Request, res: Response) {
    const { t, c } = req.params;
    const options = parseOptions(req);

    const topic = t ? await prisma.topic.findUniqueOrThrow({
        where: await Resolver.topic(t, c)
    }) : undefined;

    const course = c ? await prisma.course.findUniqueOrThrow({
        where: Resolver.course(c)
    }) : undefined;

    const stats = await topicStats({ ...options, id: topic?.id, courseId: course?.id });
    res.status(200).json(formatStats(stats, options.sort, options.skip, options.limit));
}

export async function getQuestionStats(req: Request, res: Response) {
    const { q, t, e, c } = req.params;
    const options = parseOptions(req);

    const question = q ? await prisma.question.findFirstOrThrow({
        where: await Resolver.question(q, t, e, c)
    }) : undefined;

    const topic = t ? await prisma.topic.findUniqueOrThrow({
        where: await Resolver.topic(t, c)
    }) : undefined;

    const exam = e ? await prisma.exam.findUniqueOrThrow({
        where: await Resolver.exam(e, c)
    }) : undefined;

    const course = c ? await prisma.course.findUniqueOrThrow({
        where: Resolver.course(c)
    }) : undefined;

    const stats = await questionStats({
        ...options,
        id: question?.id,
        topicId: topic?.id,
        examId: exam?.id,
        courseId: course?.id
    });

    res.status(200).json(formatStats(stats, options.sort, options.skip, options.limit));
}

export async function getHourlySubmissionStats(req: Request, res: Response) {
    const { c } = req.params;
    const { before, after } = parseOptions(req);

    const course = c ? await prisma.course.findUnique({
        where: Resolver.course(c)
    }) : undefined;

    const stats = await hourlySubmissionStats(before, after, course?.id);

    res.status(200).json(stats);
}

function formatStats(stats: { submissions: number, submissionsCorrect: number }[], order: string, skip: number, limit?: number) {
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

    if (sort != "asc" && sort != "desc")
        throw new APIError("Invalid Query Param Order must be \"asc\", \"desc\" or undefined", 400);

    return {
        before: before,
        after: after,
        sort: sort,
        limit: limit,
        skip: skip
    };
}

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month, 0).getDate();
}

function addMonths(date: Date, months: number) {
    const nextDate = new Date(date);
    nextDate.setDate(1);
    nextDate.setMonth(nextDate.getMonth() + months);
    nextDate.setDate(Math.min(date.getDate(), getDaysInMonth(date.getFullYear(), date.getMonth() + 1)));
    return nextDate;
}