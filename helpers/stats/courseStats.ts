import prisma from "../../libs/prisma.js";
import { NotFoundError } from "../../middleware/errors/index.js";

const formatDatabaseDate = (date) => {
    const formattedDate = date.toISOString().replace('T', ' ').replace('Z', '');
    return formattedDate.slice(0, formattedDate.length - 1); // Remove the 'Z' character
};

const allCoursesStats = async (before: Date, after: Date) => {
    // @ts-expect-error Fix Prisma BigInt Serialize
    BigInt.prototype.toJSON = function () {
        const int = Number.parseInt(this.toString());
        return int ?? this.toString();
    };
    const bString = formatDatabaseDate(before);
    const bdate = new Date(bString);
    const courses: CourseQueryData[] = await prisma.$queryRaw`
        SELECT
            c.id AS "id",
            c.name AS "name",
            CONCAT(c."abbreviation", CAST(c."number" as VARCHAR)) AS "abbreviation",
            (SELECT COUNT(*) FROM "Question" q WHERE q."courseId" = c.id AND q.published = true) AS "totalQuestions",
            (SELECT COUNT(*) FROM "Exam" e WHERE e."courseId" = c.id AND e.published = true) AS "totalExams",
            SUM(s."timeSpent") AS "totalTimeSpent",
            SUM(s."timeSpentVideo") AS "totalTimeSpentVideo",
            COUNT(s.id) AS "totalSubmissions",
            SUM(CASE WHEN s.correct = TRUE THEN 1 ELSE 0 END) AS "totalSubmissionsCorrect"
        FROM "Course" c
                 JOIN "Question" q ON c.id = q."courseId"
                 JOIN "Submission" s ON q.ID = s."questionId"
        WHERE (s."timeStarted" >= ${after}) AND (s."timeStarted" >= ${before})
        GROUP BY c.id;
    `;

    const questionResults: QuestionQueryData[] = await prisma.$queryRaw`
        SELECT Q."courseId" AS "courseId",
               Q.ID AS "id",
               SUM(S."timeSpent") AS "totalTimeSpent",
               SUM(S."timeSpentVideo") AS "totalTimeSpentVideo",
               COUNT(S.id) AS "totalSubmissions",
               SUM(CASE WHEN S.correct = TRUE THEN 1 ELSE 0 END) AS "totalSubmissionsCorrect",
               (SELECT array_agg(DISTINCT T."id") AS "topicIds" FROM "Topic" T INNER JOIN "_QuestionToTopic" QT ON QT."B" = T.ID  WHERE QT."A" = Q.ID) AS "topicIds",
               (SELECT array_agg(DISTINCT T.name) AS "topicNames" FROM "Topic" T INNER JOIN "_QuestionToTopic" QT ON QT."B" = T.ID  WHERE QT."A" = Q.ID) AS "topicNames"
        FROM "Question" Q
                 INNER JOIN "Submission" S ON Q.ID = S."questionId"
        WHERE Q.published = true
        GROUP BY Q."courseId", Q.ID;
    `;

    const courseDataMap: { [key: string]: CourseMapData } = {};

    questionResults.forEach((question) => {
        const courseId = question.courseId;
        if (!courseDataMap[courseId]) {
            courseDataMap[courseId] = {
                id: courseId,
                questionStats: [],
            };
        }

        courseDataMap[courseId].questionStats.push({
            id: question.id,
            courseId: courseId,
            totalTimeSpent: question.totalTimeSpent,
            totalTimeSpentVideo: question.totalTimeSpentVideo,
            totalSubmissions: question.totalSubmissions,
            totalSubmissionsCorrect: question.totalSubmissionsCorrect,
            topicIds: question.topicIds,
            topicNames: question.topicNames,
        });
    });

    return courses.map((course) => {
        const courseId = course.id;
        return {
            courseId: courseId,
            courseName: course.name,
            courseAbbreviation: course.abbreviation,
            totalExams: course.totalExams,
            totalQuestions: course.totalQuestions,
            totalTimeSpent: course.totalTimeSpent,
            totalTimeSpentVideo: course.totalTimeSpentVideo,
            totalSubmissions: course.totalSubmissions,
            totalSubmissionsCorrect: course.totalSubmissionsCorrect,
            questionStats: courseDataMap[courseId]?.questionStats || [],
        };
    });
};


const courseStats = async (courseId: string, before: Date, after: Date) => {
    // @ts-expect-error Fix Prisma BigInt Serialize
    BigInt.prototype.toJSON = function () {
        const int = Number.parseInt(this.toString());
        return int ?? this.toString();
    };

    const courses: CourseQueryData[] = await prisma.$queryRaw`
        SELECT
            c.id AS "id",
            c.name AS "name",
            CONCAT(c."abbreviation", CAST(c."number" as VARCHAR)) AS "abbreviation",
            (SELECT COUNT(*) FROM "Question" q WHERE q."courseId" = c.id AND q.published = true) AS "totalQuestions",
            (SELECT COUNT(*) FROM "Exam" e WHERE e."courseId" = c.id AND e.published = true) AS "totalExams",
            SUM(s."timeSpent") AS "totalTimeSpent",
            SUM(s."timeSpentVideo") AS "totalTimeSpentVideo",
            COUNT(s.id) AS "totalSubmissions",
            SUM(CASE WHEN s.correct = TRUE THEN 1 ELSE 0 END) AS "totalSubmissionsCorrect"
        FROM "Course" c
                 JOIN "Question" q ON c.id = q."courseId"
                 JOIN "Submission" s ON q.ID = s."questionId"
        WHERE c.id = ${courseId} AND c.published = true AND (s."timeStarted" >= ${after}) AND (s."timeStarted" >= ${before})
        group by c.id;
    `;

    const course = courses[0];

    if (!course) {
        throw new NotFoundError("Course not found");
    }

    const questions: QuestionQueryData[] = await prisma.$queryRaw`
        SELECT Q.ID AS "id",
               SUM(S."timeSpent") AS "totalTimeSpent",
               SUM(S."timeSpentVideo") AS "totalTimeSpentVideo",
               COUNT(S.id) AS "totalSubmissions",
               SUM(CASE WHEN S.correct = TRUE THEN 1 ELSE 0 END) AS "totalSubmissionsCorrect",
               (SELECT array_agg(DISTINCT T."id") AS "topicIds" FROM "Topic" T INNER JOIN "_QuestionToTopic" QT ON QT."B" = T.ID  WHERE QT."A" = Q.ID) AS "topicIds",
               (SELECT array_agg(DISTINCT T.name) AS "topicNames" FROM "Topic" T INNER JOIN "_QuestionToTopic" QT ON QT."B" = T.ID  WHERE QT."A" = Q.ID) AS "topicNames"
        FROM "Question" Q
                 INNER JOIN "Submission" S ON Q.ID = S."questionId"
        WHERE Q."courseId" = ${course.id} 
        GROUP BY Q.ID;
    `;

    return {
        courseId: course.id,
        courseName: course.name,
        courseAbbreviation: course.abbreviation,
        totalExams: course.totalExams,
        totalQuestions: course.totalQuestions,
        totalTimeSpent: course.totalTimeSpent,
        totalTimeSpentVideo: course.totalTimeSpentVideo,
        totalSubmissions: course.totalSubmissions,
        totalSubmissionsCorrect: course.totalSubmissionsCorrect,
        questionStats: questions,
    };
};

export {
    allCoursesStats,
    courseStats
};