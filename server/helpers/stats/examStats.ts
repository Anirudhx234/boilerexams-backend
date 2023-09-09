import prisma from "../../libs/prisma.js";
import msToHMS from "../../utils/msToHMS.js";

const minimumValidSubmissionTime = 0

const examStats = async (examId: string) => {
    const submissions = await prisma.submission.aggregate({
        where: {
            question: {
                examId: examId,
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
    })

    const correctSubmissions = await prisma.submission.count({
        where: {
            question: {
                examId: examId
            },
            timeSpent: {
                gte: minimumValidSubmissionTime
            },
            correct: true
        }
    })

    const totalTimeSpent = msToHMS(submissions._sum.timeSpent)
    const totalVideoWatchTime = msToHMS(submissions._sum.timeSpentVideo)

    const examStats = {
        totalTimeSpent: totalTimeSpent,
        totalVideoWatchTime: totalVideoWatchTime,
        totalSubmissions: submissions._count,
        totalCorrectSubmissions: correctSubmissions
    }
    return examStats
}

export default examStats