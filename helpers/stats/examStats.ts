import prisma from "../../prisma/prisma.js";
import { z } from "zod";
import { ExamStats } from "../../controllers/statsController.js";

export async function examStats(options: ExamStatsOptions): Promise<z.infer<typeof ExamStats>[]> {
    return await prisma.$queryRaw`
        SELECT
            1 AS "count",
            e.id as "id",
               (
                   SELECT COUNT(*)
                   FROM "Question" q
                   WHERE q."examId" = e.id
                     AND q.flags & 1 = 1
               )::INTEGER AS "questions",
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
        FROM "Exam" e
                 JOIN "Question" q ON e.id = q."examId"
                 JOIN "Submission" s ON q.id = s."questionId"
        WHERE e.flags & 1 = 1
          AND q.flags & 1 = 1
          AND (${!options.id} = ${ true} OR e.id = ${ options.id})
          AND (${!options.courseId} = ${ true} OR e."courseId" = ${ options.courseId})
          AND (s."timeStarted" BETWEEN SYMMETRIC ${ options.after} AND ${ options.before})
        GROUP BY e.id;
    `;
}
