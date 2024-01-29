import prisma from "../../libs/prisma.js";
import msToHMS from "../../utils/msToHMS.js";

const minimumValidSubmissionTime = 0;

const questionStats = async (questionId: string) => {
    const submissions = await prisma.submission.aggregate({
        where: {
            question: {
                id: questionId,
                published: true,
            },
            timeSpent: {
                gte: minimumValidSubmissionTime,
            },
        },
        _sum: {
            timeSpent: true,
            timeSpentVideo: true,
        },
        _count: true,
    });

    const correctSubmissions = await prisma.submission.count({
        where: {
            question: {
                id: questionId,
                published: true,
            },
            timeSpent: {
                gte: minimumValidSubmissionTime,
            },
            correct: true,
        },
    });

    const totalTimeSpent = msToHMS(submissions._sum.timeSpent);
    const totalVideoWatchTime = msToHMS(submissions._sum.timeSpentVideo);

    return {
        totalTimeSpent: totalTimeSpent,
        totalVideoWatchTime: totalVideoWatchTime,
        totalSubmissions: submissions._count,
        totalCorrectSubmissions: correctSubmissions,
    };
};

export default questionStats;
