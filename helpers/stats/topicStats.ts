import prisma from "../../prisma/prisma.js";
import { z } from "zod";
import { TopicStats } from "../../controllers/statsController.js";

export async function topicStats(before: Date, after: Date, id?: string): Promise<z.infer<typeof TopicStats>[]> {
    return await prisma.$queryRaw`
        SELECT
            1 :: INTEGER AS "count",
            t.name::VARCHAR as "name",
               (
                   SELECT COUNT(*)
                   FROM "QuestionToTopic" qtt
                   WHERE qtt."topicId" = t.id
               )::INTEGER AS "questions",
               SUM(CASE
                       WHEN s."timeSpent" BETWEEN 0 AND 36000000
                           THEN s."timeSpent"
                       ELSE 0
                   END)::BIGINT AS "timeSpent",
               SUM(CASE
                       WHEN s."timeSpentVideo" BETWEEN 0 AND 36000000
                           THEN s."timeSpentVideo"
                       ELSE 0
                   END)::BIGINT AS "timeSpentVideo",
               COUNT(s.id)::INTEGER AS "submissions",
               SUM(CASE
                       WHEN s.correct = TRUE
                           THEN 1
                       ELSE 0
                   END)::INTEGER AS "submissionsCorrect"
        FROM "Topic" t
                 JOIN "QuestionToTopic" qt ON t.id = qt."topicId"
                 JOIN "Question" q ON qt."questionId" = q.id
                 JOIN "Submission" s ON q.id = s."questionId"
        WHERE (
            t.id = ${ id}
                OR ${!id} = ${ true}
            )
          AND q.flags & 1 = 1
          AND (
            s."timeStarted" BETWEEN SYMMETRIC ${ after}
                AND ${ before}
            )
        GROUP BY t.id;
    `;
}
