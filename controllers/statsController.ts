// ToDo Fix All
import prisma from "../libs/prisma.js";
import { Request, Response } from "express";
import Resolver from "../helpers/resolver.js";
import { NotFoundError } from "../middleware/errors/index.js";
import { courseStats } from "../helpers/stats/courseStats.js";
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


const getCourseStats = async (req: Request, res: Response) => {
    const { courseResolvable } = req.params;
    const before = req.query.before ? new Date(Number.parseInt(<string>req.query.before)) : new Date();
    const after = req.query.after ? new Date(Number.parseInt(<string>req.query.before)) : Epoch;

    const course = await prisma.course.findUniqueOrThrow({
        where: Resolver.course(courseResolvable)
    });

    if (!course) throw new NotFoundError(`Course not found: ${courseResolvable}`);
    const stats = await courseStats(before, after, course.id);

    res.status(200).json(stats[0]);
};
/*

const getCourseStatsAll = async (req: Request, res: Response) => {
    const before = req.query.before ? Number.parseInt(<string>req.query.before) : Date.now();
    const after = req.query.after ? Number.parseInt(<string>req.query.after) : 0;
    const stats = await allCoursesStats(new Date(before), new Date(after));

    res.status(200).json(stats);
};

const getCourseExamsStats = async (req: Request, res: Response) => {
    const { courseId } = req.params;

    const promises: Promise<any>[] = [];

    const course = await prisma.course.findFirst({
        where: {
            id: courseId,
            published: true,
        },
        select: {
            exams: {
                where: {
                    published: true,
                },
                select: {
                    id: true,
                    number: true,
                    semester: true,
                },
            },
        },
    });
    if (!course) {
        throw new NotFoundError("Course not found");
    }

    const examsStats: any = [];

    for (const exam of course.exams) {
        promises.push(examStats(exam.id));
    }

    const resolved = await Promise.all(promises);

    let i = 0;
    for (const exam of course.exams) {
        examsStats.push({
            id: exam.id,
            number: exam.number,
            semester: exam.semester,
            ...resolved[i],
        });
        i++;
    }

    res.status(200).json(examsStats);
};

const getExamStats = async (req: Request, res: Response) => {
    const { examId } = req.params;

    const stats = await examStats(examId);

    res.status(200).json(stats);
};

const getQuestionStats = async (req: Request, res: Response) => {
    const { questionId } = req.params;

    const mainStats = await questionStats(questionId);

    //const answerStats = await answerChoiceStats(questionId);

    const stats = {
        questionStats: mainStats,
        answerChoiceStats: answerStats,
    };

    res.status(200).json(stats);
};

const getSubmissionStats = async (req: Request, res: Response) => {
    const submissions = await prisma.submission.aggregate({
        where: {
            question: {
                published: true,
            },
            timeSpent: {
                gte: minimumValidSubmissionTime,
            },
        },
        _sum: {
            timeSpent: true,
        },
        _avg: {
            timeSpent: true,
        },
        _count: true,
    });

    const correctSubmissions = await prisma.submission.count({
        where: {
            correct: true,
            question: {
                published: true,
            },
            timeSpent: {
                gte: minimumValidSubmissionTime,
            },
        },
    });

    const totalSubmissions = submissions._count + OLD_SUBMISSIONS;

    let timeSpent = submissions._sum.timeSpent;
    if (!timeSpent) {
        timeSpent = 0;
    }

    const totalTimeSpent = msToHMS(timeSpent + OLD_TIME_SPENT_HRS * 3600000);
    const averageTimeSpent = msToHMS(submissions._avg.timeSpent);
    const percentCorrect = 100.0 * ((correctSubmissions + OLD_PERCENT_CORRECT * OLD_SUBMISSIONS) / totalSubmissions);

    const submissionsStats = {
        totalSubmissions: submissions._count + OLD_SUBMISSIONS,
        totalTimeSpent: totalTimeSpent,
        averageTimeSpent: averageTimeSpent,
        percentCorrect: percentCorrect,
    };
    res.status(200).json(submissionsStats);
};


//export { getGeneralStats, getCourseExamsStats, getQuestionStats, getExamStats, getCourseStats, getCourseStatsAll, getSubmissionStats };


 */