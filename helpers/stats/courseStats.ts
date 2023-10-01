import prisma from "../../libs/prisma.js";
import { NotFoundError } from "../../middleware/errors/index.js";
import msToHMS from "../../utils/msToHMS.js";

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

    const courseStats = {
        courseName: course.name,
        courseId: courseId,
        totalExams: course._count.exams,
        totalQuestions: course._count.questions,
        totalTimeSpent: totalTimeSpent,
        totalVideoWatchTime: totalVideoWatchTime,
        totalSubmissions: submissions._count,
        totalCorrectSubmissions: correctSubmissions._count
    };

    return courseStats;
};

export default courseStats;