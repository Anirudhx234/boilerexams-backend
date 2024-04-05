import prisma from "../../prisma/prisma.js";

export async function questionStats(before: Date, after: Date, id?: string): Promise<QuestionStats[]> {
    return await prisma.$queryRaw`
        SELECT (
            SELECT COUNT(*)
            FROM "Question" q
            WHERE (
                q.id = ${ id}
                    OR ${ id} = ${ undefined}
                )
              AND q.flags & 1 = 1
        ) AS "count"
             ,SUM(CASE
                      WHEN s."timeSpent" BETWEEN 0 AND 36000000
                          THEN s."timeSpent"
                      ELSE 0
            END) AS "timeSpent"
             ,SUM(CASE
                      WHEN s."timeSpentVideo" BETWEEN 0 AND 36000000
                          THEN s."timeSpentVideo"
                      ELSE 0
            END) AS "timeSpentVideo"
             ,COUNT(s.id) AS "submissions"
             ,SUM(CASE
                      WHEN s.correct = TRUE
                          THEN 1
                      ELSE 0
            END) AS "submissionsCorrect"
        FROM "Question" q
                 JOIN "Submission" s ON q.id = s."questionId"
        WHERE (
            q.id = ${ id}
                OR ${ id} = ${ undefined}
            )
          AND q.flags & 1 = 1
          AND (
            s."timeStarted" BETWEEN SYMMETRIC ${ after}
                AND ${ before}
            )
        GROUP BY COALESCE(q."parentId", q."id");
        -- Group by parentId if it exists, otherwise by id
    `;
}