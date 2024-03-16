import prisma from "../../libs/prisma.js";

// ToDo Deprecated

const answerChoiceStats = async (questionId: string) => {
    const stats: any = await prisma.$queryRaw`
        SELECT
            COUNT(s.id) AS "submissionCount"
        FROM
            "Question" q
        LEFT JOIN
            "Data" ac ON q.id = ac."questionId"
        LEFT JOIN
            "Submission" s ON q.id = s."questionId" AND ac."data" = ANY(s."data")
        WHERE
            q.id = ${questionId}
        GROUP BY
            ac.id
        ORDER BY
            ac."choiceIndex" ASC;
    `;

    const rawStats: number[] = stats.map((stat) => Number(stat.submissionCount));
    return rawStats;
};