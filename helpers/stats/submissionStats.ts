import prisma from "../../prisma/prisma.js";
import { z } from "zod";
import { SubmissionStats } from "../../controllers/statsController.js";

export async function submissionStats(before: Date, after: Date, id?: string): Promise<z.infer<typeof SubmissionStats>[]> {
    return await prisma.$queryRaw`
        SELECT 1::INTEGER AS "count",
               SUM(s."timeSpent")::BIGINT AS "timeSpent",
               SUM(s."timeSpentVideo")::BIGINT AS "timeSpentVideo",
               COUNT(s.id)::INTEGER AS "submissions",
               SUM(CASE
                       WHEN s.correct = TRUE
                           THEN 1
                       ELSE 0
                   END)::INTEGER AS "submissionsCorrect"
        FROM "Submission" s
        WHERE (
            s.id = ${ id}
                OR ${ id} = ${ undefined}
            )
          AND (
            s."timeStarted" BETWEEN SYMMETRIC ${ after}
                AND ${ before}
            )
        GROUP BY s.id;
    `;
}


type TimedSubmissionQueryData = {
    submission_hour: Date;
    submissions_count: number;
};

export async function allSubmissionTimeStats() {
    const stats: TimedSubmissionQueryData[] = await prisma.$queryRaw`
        SELECT date_trunc('hour', S."timeEnded") AS submission_hour, COUNT(*) AS submissions_count FROM "Submission" S WHERE S."timeEnded" >= now() - INTERVAL '6 months' GROUP BY submission_hour ORDER BY submission_hour;
    `;
    const chartData = stats.map((stat) => {
        return {
            x: stat.submission_hour,
            y: stat.submissions_count,
        };
    });
    return chartData;
}

export async function courseSubmissionTimeStats(courseId: string) {
    const stats: TimedSubmissionQueryData[] = await prisma.$queryRaw`
    SELECT
        date_trunc('hour', S."timeEnded") AS submission_hour,
        COUNT(*) AS submissions_count
    FROM
        "Submission" S
    JOIN
        "Question" Q ON S."questionId" = Q.ID
    JOIN 
        "Course" C ON C.id = Q."courseId"
    WHERE
        S."timeEnded" >= now() - INTERVAL '6 months'
        AND (CONCAT(c."abbreviation", CAST(c."number" as VARCHAR)) = ${courseId}
            OR c."id" = ${courseId})
    GROUP BY
        submission_hour
    ORDER BY
        submission_hour;
  `;
    const chartData = stats.map((stat) => {
        return {
            x: stat.submission_hour,
            y: stat.submissions_count,
        };
    });
    return chartData;
}