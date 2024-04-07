// ToDo Fix All
import Boilerexams from "../server.js";
import prisma from "../prisma/prisma.js";
import { Request, Response } from "express";
import Resolver from "../helpers/resolver.js";
import { courseStats } from "../helpers/stats/courseStats.js";
import { examStats } from "../helpers/stats/examStats.js";
import { questionStats } from "../helpers/stats/questionStats.js";
import { Epoch } from "../prisma/schema.js";

export async function generalStats(req: Request, res: Response) {
    const courseStats = await prisma.course.stats({  });
    const combinedCourseStats = courseStats.reduce((a, b) => {
       return {
           count: a.count,
           exams: a.exams + b.exams,
           questions: a.questions + b.questions,
           submissions: a.submissions + b.submissions,
           submissionsCorrect: a.submissionsCorrect + b.submissionsCorrect,
           timeSpent: a.timeSpent + b.timeSpent,
           timeSpentVideo: a.timeSpentVideo + b.timeSpentVideo
       };
    });

    res.status(200).send({
        students:       10000,
        courses:        combinedCourseStats.count,
        exams:          combinedCourseStats.exams,
        questions:      combinedCourseStats.questions,
        submissions:    combinedCourseStats.submissions,
        timeSpent:      combinedCourseStats.timeSpent,
        timeSpentVideo: combinedCourseStats.timeSpentVideo,
        percentCorrect: 100 * combinedCourseStats.submissionsCorrect / combinedCourseStats.submissions,
    });
}

export async function getCourseStats(req: Request, res: Response) {
    const { c } = req.params;
    const before = req.query.before ? new Date(Number.parseInt(<string>req.query.before)) : new Date();
    const after = req.query.after ? new Date(Number.parseInt(<string>req.query.before)) : Epoch;

    const course = await prisma.course.findUnique({
        where: Resolver.course(c)
    });

    const stats = await courseStats(before, after, course?.id);

    res.status(200).json(stats.reduce((a, b) => {
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
    const { e, c  } = req.params;
    const before = req.query.before ? new Date(Number.parseInt(<string>req.query.before)) : new Date();
    const after = req.query.after ? new Date(Number.parseInt(<string>req.query.before)) : Epoch;

    const exam = await prisma.exam.findUnique({
        where: await Resolver.exam(e, c)
    });

    const stats = await examStats(before, after, exam?.id);

    res.status(200).json(stats.reduce((a, b) => {
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
    const { q, t, e, c  } = req.params;
    const before = req.query.before ? new Date(Number.parseInt(<string>req.query.before)) : new Date();
    const after = req.query.after ? new Date(Number.parseInt(<string>req.query.before)) : Epoch;

    const question = await prisma.question.findFirst({
        where: await Resolver.question(q, t, e, c)
    });

    const stats = await questionStats(before, after, question?.id);

    res.status(200).json(stats.reduce((a, b) => {
        return {
            count: a.count + b.count,
            submissions: a.submissions + b.submissions,
            submissionsCorrect: a.submissionsCorrect + b.submissionsCorrect,
            timeSpent: a.timeSpent + b.timeSpent,
            timeSpentVideo: a.timeSpentVideo + b.timeSpentVideo
        };
    }));
}