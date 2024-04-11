import { Epoch } from "../../prisma/schema.js";
import prisma from "../../prisma/prisma.js";
import { answerChoiceStats } from "./answerChoiceStats.js";
import { examStats } from "./examStats.js";
import { questionStats } from "./questionStats.js";
import { courseStats } from "./courseStats.js";
import Scheduler from "../scheduler.js";
import { topicStats } from "./topicStats.js";
import {
    AnswerChoiceStats,
    CourseStats,
    ExamStats,
    QuestionStats,
    TopicStats
} from "../../controllers/statsController.js";


export function scheduleUpdateStats() {
    const date = new Date(); // Current date and time
    const second = 1000;
    const minute = 60 * second;
    const hour = 60 * minute;

    if (date.getMinutes() === 0) { // Schedule every hour on the hour
        Scheduler.schedule(updateStats, 0, hour);
    } else {
        date.setHours(date.getHours() + 1);
        date.setMinutes(0);
        date.setSeconds(0);
        const difference = date.getTime() - new Date().getTime();
        Scheduler.schedule(updateStats, difference, hour);
    }
}

async function updateStats() {
    const before = new Date();
    const after = Epoch;
    const cStats = await courseStats({ before: before, after: after });
    const eStats = await examStats({ before: before, after: after });
    const tStats = await topicStats({ before: before, after: after });
    const qStats = await questionStats({ before: before, after: after });
    const acStats = await answerChoiceStats({ before: before, after: after });

    console.log(`Stats update started at ${Date.now()}`);

    console.log("Updating Courses");
    for (const stat of cStats) {
        await prisma.course.update({
            where: {
                id: stat.id
            },
            data: {
                stats: {
                    ...CourseStats.parse(stat),
                    count: undefined,
                    id: undefined,
                } as object
            }
        });
    }

    console.log("Updating Exams");
    for (const stat of eStats) {
        await prisma.exam.update({
            where: {
                id: stat.id
            },
            data: {
                stats: {
                    ...ExamStats.parse(stat),
                    count: undefined,
                    id: undefined,
                } as object
            }
        });
    }

    console.log("Updating Topics");
    for (const stat of tStats) {
        await prisma.topic.update({
            where: {
                id: stat.id
            },
            data: {
                stats: {
                    ...TopicStats.parse(stat),
                    count: undefined,
                    name: undefined,
                    id: undefined,
                } as object
            }
        });
    }

    console.log("Updating Questions");
    for (const stat of qStats) {
        await prisma.question.update({
            where: {
                id: stat.id
            },
            data: {
                stats: {
                    ...QuestionStats.parse(stat),
                    count: undefined,
                    id: undefined,
                } as object
            }
        });
    }

    console.log("Updating AnswerChoices");
    for (const stat of acStats) {
        await prisma.answerChoice.update({
            where: {
                id: stat.id
            },
            data: {
                stats: {
                    ...AnswerChoiceStats.parse(stat),
                    id: undefined,
                    index: undefined
                }
            }
        });
    }

    console.log(`Stats update completed at ${Date.now()}`);
}