import prisma from "../../libs/prisma.js";
import { NotFoundError } from "../../middleware/errors/index.js";
import msToHMS from "../../utils/msToHMS.js";
import questionStats from "./questionStats.js";

const minimumValidSubmissionTime = 0;

const courseStats = async (courseId: string) => {
    const promises: Promise<any>[] = [];

    const course = await prisma.course.findFirst({
        where: {
            id: courseId,
            published: true
        },
        include: {
            _count: {
                select: {
                    exams: {
                        where: {
                            published: true
                        }
                    },
                    questions: {
                        where: {
                            published: true
                        }
                    }
                }
            }
        }
    });
    if (!course) {
        throw new NotFoundError("Course not found");
    }

    promises.push(prisma.submission.aggregate({
        where: {
            question: {
                courseId: courseId,
                published: true
            },
            timeSpent: {
                gte: minimumValidSubmissionTime
            }
        },
        _count: true,
        _sum: {
            timeSpent: true,
            timeSpentVideo: true,
        }
    }));

    promises.push(prisma.submission.aggregate({
        where: {
            question: {
                courseId: courseId,
                published: true
            },
            timeSpent: {
                gte: minimumValidSubmissionTime
            },
            correct: true
        },
        _count: true,
    }));

    const resolved = await Promise.all(promises);
    const submissions = resolved[0];
    const correctSubmissions = resolved[1];

    const totalTimeSpent = msToHMS(submissions._sum.timeSpent);
    const totalVideoWatchTime = msToHMS(submissions._sum.timeSpentVideo);

    const courseQuestions = await prisma.question.findMany({
        where: {
            courseId: courseId,
            published: true
        },
        select: {
            id: true
        }
    });

    const courseQuestionStats = await Promise.all(courseQuestions.map(async (question) => {
        return questionStats(question.id);
    }));


    const courseStats = {
        courseName: course.name,
        courseId: courseId,
        totalExams: course._count.exams,
        totalQuestions: course._count.questions,
        totalTimeSpent: totalTimeSpent,
        totalVideoWatchTime: totalVideoWatchTime,
        totalSubmissions: submissions._count,
        totalCorrectSubmissions: correctSubmissions._count,
        questionStats: courseQuestionStats
    };

    return courseStats;
};

export default courseStats;