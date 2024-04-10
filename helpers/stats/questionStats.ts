import prisma from "../../prisma/prisma.js";
import { z } from "zod";
import { QuestionStats } from "../../controllers/statsController.js";

export async function questionStats(before: Date, after: Date, id?: string): Promise<z.infer<typeof QuestionStats>[]> {
    return await prisma.$queryRaw`
        SELECT 
             1::INTEGER AS "count",
             SUM(CASE
                      WHEN s."timeSpent" BETWEEN 0 AND 3600000
                          THEN s."timeSpent"
                      ELSE 0
            END)::BIGINT AS "timeSpent",
                SUM(CASE
                      WHEN s."timeSpentVideo" BETWEEN 0 AND 3600000
                          THEN s."timeSpentVideo"
                      ELSE 0
            END)::BIGINT AS "timeSpentVideo",
                COUNT(s.id)::INTEGER AS "submissions",
                SUM(CASE
                      WHEN s.correct = TRUE
                          THEN 1
                      ELSE 0
            END)::INTEGER AS "submissionsCorrect"
        FROM "Question" q
                 JOIN "Submission" s ON q.id = s."questionId"
        WHERE (
            q.id = ${ id}
                OR ${!id} = ${ true}
            )
          AND q.flags & 1 = 1
          AND (
            s."timeStarted" BETWEEN SYMMETRIC ${ after}
                AND ${ before}
            )
        GROUP BY q.id;
    `;
}