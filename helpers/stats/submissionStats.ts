import prisma from "../../prisma/prisma.js";
import { z } from "zod";
import { HourlyStats, SubmissionStats } from "../../controllers/statsController.js";

export async function submissionStats(options: SubmissionStatsOptions): Promise<z.infer<typeof SubmissionStats>[]> {
    return await prisma.$queryRaw`
        SELECT 
               1::INTEGER AS "count",
               s.id::VARCHAR as "id",
               SUM(s."timeSpent")::BIGINT AS "timeSpent",
               SUM(s."timeSpentVideo")::BIGINT AS "timeSpentVideo",
               COUNT(s.id)::INTEGER AS "submissions",
               SUM(CASE WHEN s.correct = TRUE THEN 1 ELSE 0 END)::INTEGER AS "submissionsCorrect"
        FROM "Submission" s
        WHERE (
            s.id = ${options.id}
                OR ${!options.id} = ${true}
            )
          AND (
            s."timeStarted" BETWEEN SYMMETRIC ${ options.before}
                AND ${ options.after}
            )
        GROUP BY s.id;
    `;
}

export async function hourlySubmissionStats(before: Date, after: Date, courseId?: string): Promise<z.infer<typeof HourlyStats>[]> {
    return prisma.$queryRaw`
        SELECT   Date_trunc('hour', s."timeEnded") AS x,
                 Count(*)                          AS y
        FROM     "Submission" S
                     JOIN     "Question" Q
                              ON       s."questionId" = q.id
                     JOIN     "Course" C
                              ON       c.id = q."courseId"
        WHERE    s."timeStarted" BETWEEN SYMMETRIC ${ after} AND ${ before}
          AND    (c.id = ${ courseId} OR ${!courseId} = ${ true})
          AND    c.flags & 1 = 1
        GROUP BY x
        ORDER BY x;
    `;
}