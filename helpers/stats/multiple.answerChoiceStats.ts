import prisma from "../../libs/prisma.js";
import _ from "lodash";
import { Prisma } from "@prisma/client";

const answerChoiceStats = async (questionIds: string[]) => {
    if (questionIds.length == 0) {
        return []
    }

    const stats: any = await prisma.$queryRaw`
        SELECT
            q.id AS "questionId",
            COUNT(s.id) AS "submissionCount"
        FROM
            "Question" q
        LEFT JOIN
            "AnswerChoice" ac ON q.id = ac."questionId"
        LEFT JOIN
            "Submission" s ON q.id = s."questionId" AND ac."choiceIndex" = ANY(s."selectedChoiceIndices")
        WHERE
            q.id IN (${Prisma.join(questionIds)})
        GROUP BY
            q.id, ac.id
        ORDER BY
            ARRAY_POSITION(ARRAY[${Prisma.join(questionIds)}]::text[], q."id"), ac."choiceIndex" ASC;
    `;

    const rawStats: number[][] = _.chain(stats)
        .groupBy("questionId")
        .map((groupedItems) => _.map(groupedItems, "submissionCount").map((submissionCount) => Number(submissionCount)))
        .value();

    return rawStats;
};

export default answerChoiceStats;

/* OLD METHOD USING PRISMA ONLY
const answerChoiceStats = async (questionId: string) => {
    const submissions = await prisma.submission.findMany({
        where: {
            questionId: questionId
        }
    });

    const totalAnswerChoices = await prisma.answerChoice.count({
        where: {
            questionId: questionId
        }
    });

    const answerStats: number[] = new Array(totalAnswerChoices).fill(0);

    submissions.forEach((submission) => {
        for (const index of submission.selectedChoiceIndices) {
            answerStats[index] += 1;
        }
    });
    return answerStats;
};
*/
