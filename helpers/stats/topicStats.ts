import { z } from "zod";
import prisma from "../../prisma/prisma.js";
import { TopicStats } from "../../controllers/statsController.js";

export async function topicStats(options: TopicStatsOptions): Promise<z.infer<typeof TopicStats>[]> {
    return await prisma.$queryRaw`
        SELECT 
            1::INTEGER AS "count",
            t.id::VARCHAR as "id",
            t.name::VARCHAR as "name",
            (
                SELECT COUNT(*) 
                FROM "QuestionToTopic" qtt 
                    JOIN "Question" q ON q.id = qtt."questionId"
                WHERE qtt."topicId" = t.id 
                  AND q.flags & 1 = 1
            )::INTEGER AS "questions",
            SUM(CASE WHEN s."timeSpent" BETWEEN 0 AND 36000000 THEN s."timeSpent" ELSE 0 END)::BIGINT 
                AS "timeSpent",
            SUM(CASE WHEN s."timeSpentVideo" BETWEEN 0 AND 36000000 THEN s."timeSpentVideo" ELSE 0 END)::BIGINT 
                AS "timeSpentVideo",
            COUNT(s.id)::INTEGER AS "submissions",
            SUM(CASE WHEN s.correct = TRUE THEN 1 ELSE 0 END)::INTEGER AS "submissionsCorrect"
        FROM "Topic" t
                 JOIN "QuestionToTopic" qtt ON t.id = qtt."topicId"
                 JOIN "Question" q ON qtt."questionId" = q.id
                 JOIN "Submission" s ON q.id = s."questionId"
        WHERE q.flags & 1 = 1
          AND (${!options.id} = ${true} OR t.id = ${options.id})
          AND (${!options.courseId} = ${true} OR t."courseId" = ${options.courseId})
          AND (s."timeStarted" BETWEEN SYMMETRIC ${options.after} AND ${options.before})
        GROUP BY t.id;
    `;
}