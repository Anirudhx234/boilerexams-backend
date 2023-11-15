import prisma from "../../libs/prisma.js";
import msToHMS from "../../utils/msToHMS.js";

const minimumValidSubmissionTime = 0;

const getCourseQuestionStats = async (courseId: string)=>  {
    const questions = await prisma.question.findMany({
        where: {
            courseId: courseId,
            published: true
        },
        include: {
            submissions: {
                where: {
                    timeSpent: {
                        gte: minimumValidSubmissionTime
                    }
                }
            },
            topics: true
        }
    });

    return questions.map(question => {
        const submissions = question.submissions;
        const totalTimeSpent = msToHMS(submissions.map(submission => submission.timeSpent).reduce((a, b) => a + b, 0));
        const totalVideoWatchTime = msToHMS(submissions.map(submission => submission.timeSpentVideo).reduce((a, b) => a + b, 0));
        const totalSubmissions = submissions.length;
        const totalCorrectSubmissions = submissions.filter(submission => submission.correct).length;
        return {
            id: question.id,
            topics: question.topics,
            totalTimeSpent: totalTimeSpent,
            totalVideoWatchTime: totalVideoWatchTime,
            totalSubmissions: totalSubmissions,
            totalCorrectSubmissions: totalCorrectSubmissions
        };
    });
};

const courseStats = async (courseId: string) => {
    return prisma.$queryRaw`SELECT Q.ID        AS question_id,
                                   S.timeSpent,
                                   S.timeSpentVideo,
                                   COUNT(S.id) AS submission_count,
                                   T.name
                            FROM Question Q
                                     INNER JOIN Submission S ON Q.ID = S.question
                                     INNER JOIN _QuestionToTopic QT ON Q.ID = QT.A
                                     INNER JOIN Topic T ON QT.B = T.id
                            WHERE Q.course = ${courseId}
                            GROUP BY Q.ID;`;
    /*
    const course = await prisma.course.findFirst({
        where: {
            id: courseId,
            published: true
        },
        include: {
            _count: {
                select: {
                    exams: {
                        where: {
                            published: true
                        }
                    },
                    questions: {
                        where: {
                            published: true
                        }
                    }
                }
            }
        }
    });

    if (!course) {
        throw new NotFoundError("Course not found");
    }

    const courseQuestionStats = await getCourseQuestionStats(course.id);
    const totalTimeSpent = courseQuestionStats.map(a => a.totalTimeSpent).reduce((a, b) => {
        const seconds = a.seconds + b.seconds;
        const addedMinutes = Math.floor(seconds / 60);
        const minutes = a.minutes + b.minutes + addedMinutes;
        const addedHours = Math.floor(minutes / 60);
        const hours = a.hours + b.hours + addedHours;
        return {
            hours: hours,
            minutes: minutes % 60,
            seconds: seconds % 60,
        };
    });
    const totalVideoWatchTime = courseQuestionStats.map(a => a.totalVideoWatchTime).reduce((a, b) => {
        const seconds = a.seconds + b.seconds;
        const addedMinutes = Math.floor(seconds / 60);
        const minutes = a.minutes + b.minutes + addedMinutes;
        const addedHours = Math.floor(minutes / 60);
        const hours = a.hours + b.hours + addedHours;
        return {
            hours: hours,
            minutes: minutes % 60,
            seconds: seconds % 60,
        };
    });
    const totalSubmissions = courseQuestionStats.map(a => a.totalSubmissions).reduce((a, b) => a + b, 0);
    const totalCorrectSubmissions = courseQuestionStats.map(a => a.totalCorrectSubmissions).reduce((a, b) => a + b, 0);

    return {
        courseName: course.name,
        courseId: courseId,
        totalExams: course._count.exams,
        totalQuestions: course._count.questions,
        totalTimeSpent: totalTimeSpent,
        totalVideoWatchTime: totalVideoWatchTime,
        totalSubmissions: totalSubmissions,
        totalCorrectSubmissions: totalCorrectSubmissions,
        questionStats: courseQuestionStats
    };
     */
};

export default courseStats;