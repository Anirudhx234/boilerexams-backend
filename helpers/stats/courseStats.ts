import prisma from "../../libs/prisma.js";

// ToDo Working on this

export async function courseStats(before: Date, after: Date): Promise<CourseStats[]> {
    return await prisma.$queryRaw`
        SELECT
            (SELECT COUNT(*) FROM "Question" q WHERE q."courseId" = c.id AND q.flags = true)    AS "questions",
            (SELECT COUNT(*) FROM "Exam" e WHERE e."courseId" = c.id AND e.flags = true)        AS "exams",
            SUM(s."timeSpent")                                                                  AS "timeSpent",
            SUM(s."timeSpentVideo")                                                             AS "timeSpentVideo",
            COUNT(s.id)                                                                         AS "submissions",
            SUM(CASE WHEN s.correct = TRUE THEN 1 ELSE 0 END)                                   AS "submissionsCorrect"
        FROM "Course" c
                 JOIN "Question" q ON c.id = q."courseId"
                 JOIN "Submission" s ON q.ID = s."questionId"
        WHERE c.flags = true AND q.flags = true;
    `;
    /*
    {

    }
    [
        {
            id: ""
        }
    ]
     */
    /*
    return await prisma.$queryRaw`
        SELECT
                (SELECT COUNT(*) FROM "Exam" e WHERE e.flags & 1 = 1)       AS "exams",
                (SELECT COUNT(*) FROM "Question" q WHERE q.flags & 1 = 1)   AS "questions",
                SUM(submission."timeSpent")                                 AS "timeSpent",
                SUM(submission."timeSpentVideo")                            AS "timeSpentVideo",
                COUNT(submission.id)                                        AS  "submissions",
                SUM(CASE WHEN submission.correct = TRUE THEN 1 ELSE 0 END)  AS "submissionsCorrect"
        FROM
            "Question" question
        JOIN
            "Submission" submission ON question.id = submission."questionId"
        WHERE
            question.flags & 1 = 1
          AND (submission."timeStarted" BETWEEN SYMMETRIC ${after} AND ${before});
    `;
     */
}

/*
const allCoursesStats = async (before?: Date, after?: Date) => {
    const courses: CourseStats[] = await prisma.$queryRaw`
        SELECT
            (SELECT COUNT(*) FROM "Question" q WHERE q."courseId" = c.id AND q.flags = true) AS "totalQuestions",
            (SELECT COUNT(*) FROM "Exam" e WHERE e."courseId" = c.id AND e.flags = true) AS "totalExams",
            SUM(s."timeSpent") AS "totalTimeSpent",
            SUM(s."timeSpentVideo") AS "totalTimeSpentVideo",
            COUNT(s.id) AS "totalSubmissions",
            SUM(CASE WHEN s.correct = TRUE THEN 1 ELSE 0 END) AS "totalSubmissionsCorrect"
        FROM "Course" c
                 JOIN "Question" q ON c.id = q."courseId"
                 JOIN "Submission" s ON q.ID = s."questionId"
        WHERE c.flags = true AND q.flags = true
        GROUP BY c.id;
    `;

    if (before.getTime() == 0) {
        before.setTime(Date.now());
    }

    const questionResults: QuestionStats[] = await prisma.$queryRaw`
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
        WHERE Q.published = true AND (s."timeStarted" BETWEEN SYMMETRIC ${after} AND ${before}) AND Q.published = true
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
    const courses: CourseStats[] = await prisma.$queryRaw`
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
        WHERE CONCAT(c."abbreviation", CAST(c."number" as VARCHAR)) = ${courseId} AND c.published = true AND q.published = true
        group by c.id;
    `;
    // console.log("after " + after + " | before " + before + "\n");
    const course = courses[0];

    if (!course) {
        throw new NotFoundError("Course not found");
    }
    if (before.getTime() == 0) {
        before.setTime(Date.now());
    }

    const questions: QuestionStats[] = await prisma.$queryRaw`
        SELECT Q.ID AS "id",
               SUM(S."timeSpent") AS "totalTimeSpent",
               SUM(S."timeSpentVideo") AS "totalTimeSpentVideo",
               COUNT(S.id) AS "totalSubmissions",
               SUM(CASE WHEN S.correct = TRUE THEN 1 ELSE 0 END) AS "totalSubmissionsCorrect",
               (SELECT array_agg(DISTINCT T."id") AS "topicIds" FROM "Topic" T INNER JOIN "_QuestionToTopic" QT ON QT."B" = T.ID  WHERE QT."A" = Q.ID) AS "topicIds",
               (SELECT array_agg(DISTINCT T.name) AS "topicNames" FROM "Topic" T INNER JOIN "_QuestionToTopic" QT ON QT."B" = T.ID  WHERE QT."A" = Q.ID) AS "topicNames"
        FROM "Question" Q
                 INNER JOIN "Submission" S ON Q.ID = S."questionId"
        WHERE Q."courseId" = ${course.id} AND (s."timeStarted" BETWEEN SYMMETRIC ${after} AND ${before}) AND Q.published = true
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

export { allCoursesStats, courseStats };

 */