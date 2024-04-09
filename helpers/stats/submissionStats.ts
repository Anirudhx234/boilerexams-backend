import prisma from "../../prisma/prisma.js";
import { z } from "zod";
import { SubmissionStats } from "../../controllers/statsController.js";

export async function submissionStats(before: Date, after: Date, id?: string): Promise<z.infer<typeof SubmissionStats>[]> {
    return await prisma.$queryRaw`
        SELECT 1::INTEGER AS "count",
               SUM(s."timeSpent")::BIGINT AS "timeSpent",
               SUM(s."timeSpentVideo")::BIGINT AS "timeSpentVideo",
               COUNT(s.id)::INTEGER AS "submissions",
               SUM(CASE
                       WHEN s.correct = TRUE
                           THEN 1
                       ELSE 0
                   END)::INTEGER AS "submissionsCorrect"
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