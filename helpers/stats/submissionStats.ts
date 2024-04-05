import prisma from "../../prisma/prisma.js";

export async function submissionStats(before: Date, after: Date, id?: string): Promise<SubmissionStats[]> {
    return await prisma.$queryRaw`
        SELECT (
                   SELECT COUNT(*)
                   FROM "Submission" s
                   WHERE (
                             s.id = ${ id}
                                 OR ${ id} = ${ undefined}
                             )
               ) AS "count",
               SUM(s."timeSpent") AS "timeSpent",
               SUM(s."timeSpentVideo") AS "timeSpentVideo",
               COUNT(s.id) AS "submissions",
               SUM(CASE
                       WHEN s.correct = TRUE
                           THEN 1
                       ELSE 0
                   END) AS "submissionsCorrect"
        FROM "Submission" s
        WHERE (
            s.id = ${ id}
                OR ${ id} = ${ undefined}
            )
          AND (
            s."timeStarted" BETWEEN SYMMETRIC ${ after}
                AND ${ before}
            )
        GROUP BY s.id;
    `;
}