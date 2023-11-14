import prisma from "../../libs/prisma.js";
import {NotFoundError} from "../../middleware/errors/index.js";
import msToHMS from "../../utils/msToHMS.js";

const minimumValidSubmissionTime = 0

const getCourseQuestionStats = async (courseId: string)=>  {
    const questions = await prisma.question.findMany({
        where: {
            courseId: courseId,
            published: true
        },
        include: {
            submissions: {
                where: {
                    timeSpent: {
                        gte: minimumValidSubmissionTime
                    }
                }
            },
            topics: true
        }
    });

    return questions.map(question => {
        const submissions = question.submissions;
        const totalTimeSpent = msToHMS(submissions.map(submission => submission.timeSpent).reduce((a, b) => a + b));
        const totalVideoWatchTime = msToHMS(submissions.map(submission => submission.timeSpentVideo).reduce((a, b) => a + b));
        const totalSubmissions = submissions.length;
        const totalCorrectSubmissions = submissions.filter(submission => submission.correct).length;
        return {
            id: question.id,
            topics: question.topics,
            totalTimeSpent: totalTimeSpent,
            totalVideoWatchTime: totalVideoWatchTime,
            totalSubmissions: totalSubmissions,
            totalCorrectSubmissions: totalCorrectSubmissions
        };
    });
};

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

    const courseQuestionStats = await getCourseQuestionStats(course.id);

    return {
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
};

export default courseStats;