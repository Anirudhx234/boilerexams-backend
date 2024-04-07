import prisma from "../../prisma/prisma.js";

// ToDo Working on this

export async function examStats(before: Date, after: Date, id?: string): Promise<ExamStats[]> {
    return await prisma.$queryRaw`
        SELECT
            1 :: INTEGER AS "count",
               (
                   SELECT COUNT(*)
                   FROM "Question" q
                   WHERE q."examId" = e.id
                     AND q.flags & 1 = 1
               )::INTEGER AS "questions",
               SUM(CASE
                       WHEN s."timeSpent" BETWEEN 0 AND 36000000
                           THEN s."timeSpent"
                       ELSE 0
                   END)::BIGINT AS "timeSpent",
               SUM(CASE
                       WHEN s."timeSpentVideo" BETWEEN 0 AND 36000000
                           THEN s."timeSpentVideo"
                       ELSE 0
                   END)::BIGINT AS "timeSpentVideo",
               COUNT(s.id)::INTEGER AS "submissions",
               SUM(CASE
                       WHEN s.correct = TRUE
                           THEN 1
                       ELSE 0
                   END)::INTEGER AS "submissionsCorrect"
        FROM "Exam" e
                 JOIN "Question" q ON e.id = q."examId"
                 JOIN "Submission" s ON q.id = s."questionId"
        WHERE (
            e.id = ${ id}
                OR ${!id} = ${ true}
            )
          AND e.flags & 1 = 1
          AND q.flags & 1 = 1
          AND (
            s."timeStarted" BETWEEN SYMMETRIC ${ after}
                AND ${ before}
            )
        GROUP BY e.id;
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
