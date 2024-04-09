import { Epoch } from "../../prisma/schema.js";
import prisma from "../../prisma/prisma.js";
import { answerChoiceStats } from "./answerChoiceStats.js";
import { examStats } from "./examStats.js";
import { questionStats } from "./questionStats.js";
import { courseStats } from "./courseStats.js";
import Scheduler from "../scheduler.js";


export function scheduleUpdateStats() {
    const now = new Date(); // Current date and time
    const second = 1000;
    const minute = 60 * second;
    const hour = 60 * minute;
    const day = 24 * hour;

    const targetTime = new Date(now);
    targetTime.setHours(4, 0, 0, 0);

    const difference = Math.abs(now.getTime() - targetTime.getTime());
    const delay = Math.abs(day - difference);

    // Schedule at 4am every day
    Scheduler.schedule(updateStats, delay, hour);
}

export const defaultAnswerChoiceStats = {
    count: 0
};

export const defaultQuestionStats = {
    count: 1,
    submissions: 0,
    submissionsCorrect: 0,
    timeSpent: 0n,
    timeSpentVideo: 0n
};

export const defaultExamStats = {
    ...defaultQuestionStats,
    questions: 0
};

export const defaultCourseStats = {
    ...defaultExamStats,
    exams: 0
};

async function updateStats() {
    const before = new Date();
    const after = Epoch;
    const courses = await prisma.course.findMany({ select: { id: true } });
    const exams = await prisma.exam.findMany({ select: { id: true } });
    const questions = await prisma.question.findMany({ select: { id: true } });
    const answerChoices = await prisma.answerChoice.findMany({ select:
            { id: true, questionId: true, index: true }
    });

    console.log(`Stats update started at ${Date.now()}`);

    for (const course of courses) {
        const stats = await courseStats(before, after, course.id);
        const stat = stats[0];
        await prisma.course.update({
            where: {
                id: course.id
            },
            data: {
                stats: stat ? stat as object : defaultCourseStats
            }
        });
    }

    for (const exam of exams) {
        const stats = await examStats(before, after, exam.id);
        const stat = stats[0];
        await prisma.exam.update({
            where: {
                id: exam.id
            },
            data: {
                stats: stat ? stat as object : defaultExamStats
            }
        });
    }

    for (const question of questions) {
        const stats = await questionStats(before, after, question.id);
        const stat = stats[0];
        await prisma.question.update({
            where: {
                id: question.id
            },
            data: {
                stats: stat ? stat as object : defaultQuestionStats
            }
        });
    }


    for (const answerChoice of answerChoices) {
        const stats = await answerChoiceStats(answerChoice.questionId, answerChoice.index);
        const stat = stats[0];
        await prisma.answerChoice.update({
            where: {
                id: answerChoice.id
            },
            data: {
                stats: stat ? stat as object : defaultAnswerChoiceStats
            }
        });
    }

    console.log(`Stats update completed at ${Date.now()}`);
}