import prisma from "../../libs/prisma.js";

// ToDo Rework

export async function questionStats(before: Date, after: Date, id?: string): Promise<QuestionStats> {
    return await prisma.$queryRaw`
        SELECT
            (SELECT COUNT(*) FROM "Question" q WHERE
                (q.id = ${id} OR ${id} = ${undefined}) AND
                q.flags & 1 = true)                             AS "count",
            SUM(s."timeSpent")                                  AS "timeSpent",
            SUM(s."timeSpentVideo")                             AS "timeSpentVideo",
            COUNT(s.id)                                         AS "submissions",
            SUM(CASE WHEN s.correct = TRUE THEN 1 ELSE 0 END)   AS "submissionsCorrect"
        FROM "Question" q
                 JOIN "Submission" s ON q.id = s."questionId"
        WHERE
            (q.id = ${id} OR ${id} = ${undefined}) AND
            q.flags & 1 = true AND
            (s."timeStarted" BETWEEN SYMMETRIC ${after} AND ${before})
        GROUP BY q.id
    `;
}