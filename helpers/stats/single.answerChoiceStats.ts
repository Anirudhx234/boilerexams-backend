import prisma from "../../libs/prisma.js";
import _ from 'lodash';

const answerChoiceStats = async (questionId: string) => {
    const stats: any = await prisma.$queryRaw`
        SELECT
            COUNT(s.id) AS "submissionCount"
        FROM
            "Question" q
        LEFT JOIN
            "AnswerChoice" ac ON q.id = ac."questionId"
        LEFT JOIN
            "Submission" s ON q.id = s."questionId" AND ac."choiceIndex" = ANY(s."selectedChoiceIndices")
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

export default answerChoiceStats;