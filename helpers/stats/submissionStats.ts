import prisma from "../../libs/prisma.js";
import { NotFoundError } from "../../middleware/errors/index.js";

const allSubmissionTimeStats = async () => {
    // @ts-expect-error Fix Prisma BigInt Serialize
    BigInt.prototype.toJSON = function () {
        const int = Number.parseInt(this.toString());
        return int ?? this.toString();
    };

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
};
const courseSubmissionTimeStats = async (courseId: string) => {
    // @ts-expect-error Fix Prisma BigInt Serialize
    BigInt.prototype.toJSON = function () {
        const int = Number.parseInt(this.toString());
        return int ?? this.toString();
    };

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
        AND CONCAT(c."abbreviation", CAST(c."number" as VARCHAR)) = ${courseId}
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
export {allSubmissionTimeStats, courseSubmissionTimeStats};