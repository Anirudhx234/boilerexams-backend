import prisma from "../../libs/prisma.js";

const questionStats = async (questionId: string) => {
    const submissions = await prisma.submission.aggregate({
        where: {
            questionId: questionId
        },
        _sum: {
            timeSpent: true,
            timeSpentVideo: true,
        },
        _count: true,
    })
    const timeSpent = submissions._sum.timeSpent
    const timeSpentVideo = submissions._sum.timeSpentVideo
    const submissionTotal = submissions._count

    const submissionCorrect = await prisma.submission.count({
        where: {
            questionId: questionId,
            correct: true
        }
    })
    return { timeSpent, timeSpentVideo, submissionTotal, submissionCorrect }
}

export default questionStats