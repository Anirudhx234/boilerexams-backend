import prisma from "../../prisma/prisma.js";
import { z } from "zod";
import { CourseStats } from "../../controllers/statsController.js";

export async function courseStats(options: CourseStatsOptions): Promise<z.infer<typeof CourseStats>[]> {
    return prisma.$queryRaw`
        SELECT c.id::VARCHAR as "id",
               1::INTEGER AS "count",
               (SELECT COUNT(*)::INTEGER FROM "Question" q 
                WHERE q."courseId" = c.id AND q."parentId" IS NULL AND q.flags & 1 = 1)::INTEGER 
                   AS "questions",
               (SELECT COUNT(*)::INTEGER FROM "Exam" e 
                WHERE e."courseId" = c.id AND e.flags & 1 = 1)::INTEGER 
                   AS "exams",
               COUNT(s.id)::INTEGER AS "submissions",
               SUM(CASE WHEN s.correct = TRUE THEN 1 ELSE 0 END)::INTEGER AS "submissionsCorrect",
               SUM(CASE WHEN s."timeSpent" BETWEEN 0 AND 3600000 THEN s."timeSpent" ELSE 0 END)::BIGINT 
                   AS "timeSpent",
               SUM(CASE WHEN s."timeSpentVideo" BETWEEN 0 AND 3600000 THEN s."timeSpentVideo" ELSE 0 END)::BIGINT 
                   AS "timeSpentVideo"
        FROM "Course" c
                 JOIN "Question" q ON c.id = q."courseId" AND q."parentId" IS NULL
                 JOIN "Submission" s ON q.ID = s."questionId"
        WHERE c.flags & 1 = 1 
          AND q.flags & 1 = 1 
          AND (${!options.id} = ${ true} OR c.id = ${ options.id})
          AND (s."timeStarted" BETWEEN SYMMETRIC ${ options.after} AND ${ options.before})
        GROUP BY c.id
    `;
}
