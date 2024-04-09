import prisma from "../prisma/prisma.js";
import { Request, Response } from "express";
import Resolver from "../helpers/resolver.js";
import { Epoch } from "../prisma/schema.js";
import { courseStats } from "../helpers/stats/courseStats.js";
import { examStats } from "../helpers/stats/examStats.js";
import { questionStats } from "../helpers/stats/questionStats.js";
import { z }from "zod";
import { allSubmissionTimeStats, courseSubmissionTimeStats } from "../helpers/stats/submissionStats.js";

export const AnswerChoiceStats = z.object({
    count:  z.number().default(0),
});

export const SubmissionStats = AnswerChoiceStats.extend({
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
    questions:  z.number().default(0)
});

export const CourseStats = ExamStats.extend({
   exams:   z.number().default(0),
});

export async function generalStats(req: Request, res: Response) {
    const courseStats = await prisma.course.stats({  });

    const combinedCourseStats = courseStats?.reduce((a, b) => {
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
        courses:            combinedCourseStats.count,
        exams:              combinedCourseStats.exams,
        questions:          combinedCourseStats.questions,
        submissions:        combinedCourseStats.submissions,
        submissionsCorrect: combinedCourseStats.submissionsCorrect,
        timeSpent:          combinedCourseStats.timeSpent,
        timeSpentVideo:     combinedCourseStats.timeSpentVideo,
    });
}

export async function getCourseStats(req: Request, res: Response) {
    const { c } = req.params;
    const now = new Date();
    const before = req.query.before ? new Date(Number.parseInt(<string>req.query.before)) : now;
    const after = req.query.after ? new Date(Number.parseInt(<string>req.query.before)) : Epoch;

    const course = c ? await prisma.course.findUnique({
        where: Resolver.course(c)
    }) : undefined;

    const stats = course ?
        before == now && after == Epoch ?
            [ course.stats ] :
            await courseStats(before, after, course.id) :
        await prisma.course.stats({
            before: before, after: after
        });

    res.status(200).json(stats.reduce((c, d) => {
        const a = c as CourseStats;
        const b = d as CourseStats;
        return {
            count: a.count + b.count,
            exams: a.exams + b.exams,
            questions: a.questions + b.questions,
            submissions: a.submissions + b.submissions,
            submissionsCorrect: a.submissionsCorrect + b.submissionsCorrect,
            timeSpent: a.timeSpent + b.timeSpent,
            timeSpentVideo: a.timeSpentVideo + b.timeSpentVideo
        };
    }));
}

export async function getExamStats(req: Request, res: Response) {
    const { e, c } = req.params;
    const now = new Date();
    const before = req.query.before ? new Date(Number.parseInt(<string>req.query.before)) : now;
    const after = req.query.after ? new Date(Number.parseInt(<string>req.query.before)) : Epoch;

    const exam = e ? await prisma.exam.findUnique({
        where: await Resolver.exam(e, c)
    }) : undefined;

    const stats = exam ?
        before == now && after == Epoch ?
            [ exam.stats ] :
            await examStats(before, after, exam.id) :
        await prisma.exam.stats({
            before: before, after: after
        });

    res.status(200).json(stats.reduce((c, d) => {
        const a = c as ExamOrTopicStats;
        const b = d as ExamOrTopicStats;
        return {
            count: a.count + b.count,
            questions: a.questions + b.questions,
            submissions: a.submissions + b.submissions,
            submissionsCorrect: a.submissionsCorrect + b.submissionsCorrect,
            timeSpent: a.timeSpent + b.timeSpent,
            timeSpentVideo: a.timeSpentVideo + b.timeSpentVideo
        };
    }));
}

export async function getQuestionStats(req: Request, res: Response) {
    const { q, t, e, c } = req.params;
    const now = new Date();
    const before = req.query.before ? new Date(Number.parseInt(<string>req.query.before)) : now;
    const after = req.query.after ? new Date(Number.parseInt(<string>req.query.before)) : Epoch;

    const question = e ? await prisma.question.findFirst({
        where: await Resolver.question(q, t, e, c)
    }) : undefined;

    const stats = question ?
        before == now && after == Epoch ?
            [ question.stats ] :
            await questionStats(before, after, question.id) :
        await prisma.course.stats({
            before: before, after: after
        });

    res.status(200).json(stats.reduce((c, d) => {
        const a = c as QuestionStats;
        const b = d as QuestionStats;
        return {
            count: a.count + b.count,
            submissions: a.submissions + b.submissions,
            submissionsCorrect: a.submissionsCorrect + b.submissionsCorrect,
            timeSpent: a.timeSpent + b.timeSpent,
            timeSpentVideo: a.timeSpentVideo + b.timeSpentVideo
        };
    }));
}

export async function getAllSubmissionTimeStats(req: Request, res: Response) {
    const stats = await allSubmissionTimeStats();

    res.status(200).json(stats);
}

export async function getCourseSubmissionTimeStats(req: Request, res: Response) {
    const { c } = req.params;

    const stats = await courseSubmissionTimeStats(c);

    res.status(200).json(stats);
}