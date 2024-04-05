import prisma from "../../prisma/prisma.js";

export async function answerChoiceStats(questionId: string, index: number): Promise<AnswerChoiceStats> {
    return await prisma.$queryRaw`
        SELECT COUNT(*) AS count
        FROM "Submission"
        WHERE "userSolution" IS NOT NULL
          AND jsonb_typeof("userSolution") = 'array'
          AND "questionId" = ${ questionId}
          AND EXISTS (
            SELECT 1
            FROM jsonb_array_elements_text("userSolution") AS elem
            WHERE elem::INT = ${ index}
        );
    `;
}
