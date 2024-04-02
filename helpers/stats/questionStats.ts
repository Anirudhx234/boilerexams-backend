import prisma from "../../libs/prisma.js";

// ToDo Rework

export async function questionStats(before: Date, after: Date): Promise<QuestionStats[]> {
    return await prisma.$queryRaw`
        SELECT
            SUM(submission."timeSpent")                                 AS "timeSpent",
            SUM(submission."timeSpentVideo")                            AS "timeSpentVideo",
            COUNT(submission.id)                                        AS "submissions",
            SUM(CASE WHEN submission.correct = TRUE THEN 1 ELSE 0 END)  AS "submissionsCorrect"
        FROM "Question" question
                 JOIN "Submission" submission ON question.id = submission."questionId"
        WHERE
            question.flags & 1 = 1
          AND (submission."timeStarted" BETWEEN SYMMETRIC ${after} AND ${before});
    `;
}