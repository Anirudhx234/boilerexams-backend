import prisma from "../../libs/prisma.js";

export async function submissionStats(before: Date, after: Date): Promise<SubmissionStats[]> {
    return await prisma.$queryRaw`
        SELECT
            SUM(submission."timeSpent")                                 AS "timeSpent",
            SUM(submission."timeSpentVideo")                            AS "timeSpentVideo"
        FROM "Submission" submission
        WHERE submission."timeStarted" BETWEEN SYMMETRIC ${after} AND ${before}
    `;
}