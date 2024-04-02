import prisma from "../../libs/prisma.js";

// ToDo Working on this

export async function examStats(before: Date, after: Date): Promise<ExamStats[]> {
    return await prisma.$queryRaw`
        SELECT
                (SELECT COUNT(*) FROM "Question" q WHERE q.flags & 1 = 1)   AS "questions",
                SUM(submission."timeSpent")                                 AS "timeSpent",
                SUM(submission."timeSpentVideo")                            AS "timeSpentVideo",
                COUNT(submission.id)                                        AS  "submissions",
                SUM(CASE WHEN submission.correct = TRUE THEN 1 ELSE 0 END)  AS "submissionsCorrect"
        FROM
            "Question" question
                JOIN
            "Submission" submission ON question.id = submission."questionId"
        WHERE
            question.flags & 1 = 1
          AND (submission."timeStarted" BETWEEN SYMMETRIC ${after} AND ${before});
    `;
}

// ToDo Rework
/*
const examStats = async (examId: string) => {
    const submissions = await prisma.submission.aggregate({
        where: {
            question: {
                examId: examId,
            },
            timeSpent: {
                gte: minimumValidSubmissionTime,
            },
        },
        _count: true,
        _sum: {
            timeSpent: true,
            timeSpentVideo: true,
        },
    });

    const correctSubmissions = await prisma.submission.count({
        where: {
            question: {
                examId: examId,
            },
            timeSpent: {
                gte: minimumValidSubmissionTime,
            },
            correct: true,
        },
    });

    const totalTimeSpent = msToHMS(submissions._sum.timeSpent);
    const totalVideoWatchTime = msToHMS(submissions._sum.timeSpentVideo);

    const examStats = {
        totalTimeSpent: totalTimeSpent,
        totalVideoWatchTime: totalVideoWatchTime,
        totalSubmissions: submissions._count,
        totalCorrectSubmissions: correctSubmissions,
    };
    return examStats;
};

export default examStats;

 */
