import prisma from "../../libs/prisma.js";

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

export default answerChoiceStats;