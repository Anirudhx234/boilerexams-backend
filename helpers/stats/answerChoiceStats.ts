import { z } from "zod";
import prisma from "../../prisma/prisma.js";
import { AnswerChoiceStats } from "../../controllers/statsController.js";

export async function answerChoiceStats(options: AnswerChoiceStatsOptions): Promise<z.infer<typeof AnswerChoiceStats>[]> {
    return await prisma.$queryRaw`
        SELECT
            COUNT(*)::INTEGER as count,
            ac.id::VARCHAR as "id",
            ac.index::INTEGER as "index"
        FROM "AnswerChoice" ac
                 JOIN "Submission" S on ac."questionId" = S."questionId"
        WHERE "userSolution" IS NOT NULL
          AND jsonb_typeof("userSolution") = 'array'
          AND (${!options.id} = ${true} OR ac.id = ${options.id})
          AND (${!options.questionId} = ${true} OR S."questionId" = ${options.questionId})
          AND (s."timeStarted" BETWEEN SYMMETRIC ${options.before} AND ${options.after})
          AND EXISTS (
            SELECT 1
            FROM jsonb_array_elements_text("userSolution") AS element
            WHERE element::INTEGER = ac.index AND ac."questionId" = S."questionId"  -- Include condition here
        )
        GROUP BY ac.id;
    `;
}
