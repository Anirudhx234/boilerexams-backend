import prisma from "../../libs/prisma.js";
import {NotFoundError} from "../../middleware/errors/index.js";

type QuestionQueryData = {
    id: string,
    timeSpent: number,
    timeSpentVideo: number,
    submissions: number,
    submissionsCorrect: number
    topicNames: string[],
    topicIds: string[]
}

type CourseQueryData = {
    id: string
    name: string,
    totalExams: number,
    totalQuestions: number,
    totalTimeSpent: number,
    totalTimeSpentVideo: number,
    totalSubmissions: number,
    totalSubmissionsCorrect: number
}



const courseStats = async (courseId: string) => {
    // @ts-expect-error Fix Prisma BigInt Serialize
    BigInt.prototype.toJSON = function () {
        const int = Number.parseInt(this.toString());
        return int ?? this.toString();
    };

    const courses: CourseQueryData[] = await prisma.$queryRaw`
        SELECT 
            c.name AS "name",
            c.id AS "id",
            (SELECT COUNT(*) FROM "Question" q WHERE q."courseId" = c.id AND q.published = true) AS "totalQuestions",
            (SELECT COUNT(*) FROM "Exam" e WHERE e."courseId" = c.id AND e.published = true) AS "totalExams",
            SUM(s."timeSpent") AS "totalTimeSpent",
            SUM(s."timeSpentVideo") AS "totalTimeSpentVideo",
            COUNT(s.id) AS "totalSubmissions",
            SUM(CASE WHEN s.correct = TRUE THEN 1 ELSE 0 END) AS "totalSubmissionsCorrect"
        FROM "Course" c
                 JOIN "Question" q ON c.id = q."courseId"
                 JOIN "Submission" s ON q.ID = s."questionId"
        WHERE c.id = ${courseId} AND c.published = true
        group by c.id;
    `;

    const course = courses[0];

    if (!course) {
        throw new NotFoundError("Course not found");
    }

    const questions: QuestionQueryData[] = await prisma.$queryRaw`
        SELECT Q.ID AS "questionId",
               SUM(S."timeSpent") AS "timeSpent",
               SUM(S."timeSpentVideo") AS "timeSpentVideo",
               COUNT(S.id) AS "submissions",
               SUM(CASE WHEN S.correct = TRUE THEN 1 ELSE 0 END) AS "submissionsCorrect",
               (SELECT array_agg(DISTINCT T.name) AS "topicNames" FROM "Topic" T INNER JOIN "_QuestionToTopic" QT ON QT."B" = T.ID  WHERE QT."A" = Q.ID) AS "topicNames",
               (SELECT array_agg(DISTINCT T."id") AS "topicIds" FROM "Topic" T INNER JOIN "_QuestionToTopic" QT ON QT."B" = T.ID  WHERE QT."A" = Q.ID) AS "topicIds"
        FROM "Question" Q
                 INNER JOIN "Submission" S ON Q.ID = S."questionId"
        WHERE Q."courseId" = ${course.id}
        GROUP BY Q.ID;
    `;

    return {
        courseName: course.name,
        courseId: course.id,
        totalExams: course.totalExams,
        totalQuestions: course.totalQuestions,
        totalTimeSpent: course.totalTimeSpent,
        totalTimeSpentVideo: course.totalTimeSpentVideo,
        totalSubmissions: course.totalSubmissions,
        totalCorrectSubmissions: course.totalSubmissionsCorrect,
        questionStats: questions,
        //topicStats: topics
    };
};

export default courseStats;