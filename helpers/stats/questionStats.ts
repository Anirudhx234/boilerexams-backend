import prisma from "../../prisma/prisma.js";
import { z } from "zod";
import { QuestionStats } from "../../controllers/statsController.js";

export async function questionStats(options: QuestionStatsOptions): Promise<z.infer<typeof QuestionStats>[]> {
    return await prisma.$queryRaw`
        SELECT q.id::VARCHAR as "id",
               1::INTEGER AS "count",
               COUNT(s.id)::INTEGER AS "submissions",
               SUM(CASE WHEN s.correct = TRUE THEN 1 ELSE 0 END)::INTEGER AS "submissionsCorrect",
               SUM(CASE WHEN s."timeSpent" BETWEEN 0 AND 3600000 THEN s."timeSpent" ELSE 0 END)::BIGINT AS "timeSpent", 
               SUM(CASE WHEN  s."timeSpentVideo" BETWEEN 0 AND 3600000 THEN s."timeSpentVideo" ELSE 0 END)::BIGINT AS "timeSpentVideo"    
        FROM "Question" q
                 JOIN "Submission" s ON q.id = s."questionId"
        WHERE q.flags & 1 = 1 -- Public Questions
          AND (q.id = ${ options.id} OR ${!options.id} = ${ true})
          AND (q."examId" = ${ options.examId} OR ${!options.examId} = ${ true})
          AND (q."courseId" = ${ options.courseId} OR ${!options.courseId} = ${ true})
          AND (s."timeStarted" BETWEEN SYMMETRIC ${ options.before} AND ${ options.after})
        GROUP BY q.id;
    `;
}