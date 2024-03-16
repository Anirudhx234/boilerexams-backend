const OLD_SUBMISSIONS = 1920571;
const OLD_TIME_SPENT_HRS = 95074.53;
const OLD_PERCENT_CORRECT = 0.6571;
const minimumValidSubmissionTime = 0;

// ToDo Fix All
/*

const getGeneralStats = async (req: Request, res: Response) => {
    const promises: Promise<any>[] = [];

    promises.push(
        prisma.course.aggregate({
            where: {
                published: true,
            },
            _count: true,
        }),
    );

    promises.push(
        prisma.exam.aggregate({
            where: {
                published: true,
            },
            _count: true,
        }),
    );

    promises.push(
        prisma.question.aggregate({
            where: {
                published: true,
            },
            _count: true,
        }),
    );

    promises.push(
        prisma.submission.aggregate({
            where: {
                question: {
                    published: true,
                },
                timeSpent: {
                    gte: minimumValidSubmissionTime,
                },
            },
            _count: true,
            _sum: {
                timeSpent: true,
            },
        }),
    );

    promises.push(
        prisma.submission.count({
            where: {
                correct: true,
                question: {
                    published: true,
                },
                timeSpent: {
                    gte: minimumValidSubmissionTime,
                },
            },
        }),
    );

    const resolved = await Promise.all(promises);
    const courses = resolved[0];
    const exams = resolved[1];
    const questions = resolved[2];
    const submissions = resolved[3];
    const correctSubmissions = resolved[4];

    let timeSpent = submissions._sum.timeSpent;
    if (!timeSpent) {
        timeSpent = 0;
    }

    const totalTimeSpent = msToHMS(timeSpent + OLD_TIME_SPENT_HRS * 3600000);
    const totalSubmissions = submissions._count + OLD_SUBMISSIONS;
    const percentCorrect = 100.0 * ((correctSubmissions + OLD_PERCENT_CORRECT * OLD_SUBMISSIONS) / totalSubmissions);

    const stats = {
        totalStudents: 10000,
        totalCourses: courses._count,
        totalExams: exams._count,
        totalQuestions: questions._count,
        totalSubmissions: submissions._count + OLD_SUBMISSIONS,
        totalTimeSpent: totalTimeSpent,
        percentCorrect: percentCorrect,
    };

    res.status(200).json(stats);
};

const getCourseStats = async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const before = req.query.before ? Number.parseInt(<string>req.query.before) : Date.now();
    const after = req.query.after ? Number.parseInt(<string>req.query.after) : 0;

    const stats = await courseStats(courseId, new Date(before), new Date(after));

    res.status(200).json(stats);
};

const getCourseStatsAll = async (req: Request, res: Response) => {
    const before = req.query.before ? Number.parseInt(<string>req.query.before) : Date.now();
    const after = req.query.after ? Number.parseInt(<string>req.query.after) : 0;
    const stats = await allCoursesStats(new Date(before), new Date(after));

    res.status(200).json(stats);
};

const getCourseExamsStats = async (req: Request, res: Response) => {
    const { courseId } = req.params;

    const promises: Promise<any>[] = [];

    const course = await prisma.course.findFirst({
        where: {
            id: courseId,
            published: true,
        },
        select: {
            exams: {
                where: {
                    published: true,
                },
                select: {
                    id: true,
                    number: true,
                    semester: true,
                },
            },
        },
    });
    if (!course) {
        throw new NotFoundError("Course not found");
    }

    const examsStats: any = [];

    for (const exam of course.exams) {
        promises.push(examStats(exam.id));
    }

    const resolved = await Promise.all(promises);

    let i = 0;
    for (const exam of course.exams) {
        examsStats.push({
            id: exam.id,
            number: exam.number,
            semester: exam.semester,
            ...resolved[i],
        });
        i++;
    }

    res.status(200).json(examsStats);
};

const getExamStats = async (req: Request, res: Response) => {
    const { examId } = req.params;

    const stats = await examStats(examId);

    res.status(200).json(stats);
};

const getQuestionStats = async (req: Request, res: Response) => {
    const { questionId } = req.params;

    const mainStats = await questionStats(questionId);

    //const answerStats = await answerChoiceStats(questionId);

    const stats = {
        questionStats: mainStats,
        answerChoiceStats: answerStats,
    };

    res.status(200).json(stats);
};

const getSubmissionStats = async (req: Request, res: Response) => {
    const submissions = await prisma.submission.aggregate({
        where: {
            question: {
                published: true,
            },
            timeSpent: {
                gte: minimumValidSubmissionTime,
            },
        },
        _sum: {
            timeSpent: true,
        },
        _avg: {
            timeSpent: true,
        },
        _count: true,
    });

    const correctSubmissions = await prisma.submission.count({
        where: {
            correct: true,
            question: {
                published: true,
            },
            timeSpent: {
                gte: minimumValidSubmissionTime,
            },
        },
    });

    const totalSubmissions = submissions._count + OLD_SUBMISSIONS;

    let timeSpent = submissions._sum.timeSpent;
    if (!timeSpent) {
        timeSpent = 0;
    }

    const totalTimeSpent = msToHMS(timeSpent + OLD_TIME_SPENT_HRS * 3600000);
    const averageTimeSpent = msToHMS(submissions._avg.timeSpent);
    const percentCorrect = 100.0 * ((correctSubmissions + OLD_PERCENT_CORRECT * OLD_SUBMISSIONS) / totalSubmissions);

    const submissionsStats = {
        totalSubmissions: submissions._count + OLD_SUBMISSIONS,
        totalTimeSpent: totalTimeSpent,
        averageTimeSpent: averageTimeSpent,
        percentCorrect: percentCorrect,
    };
    res.status(200).json(submissionsStats);
};

 */

//export { getGeneralStats, getCourseExamsStats, getQuestionStats, getExamStats, getCourseStats, getCourseStatsAll, getSubmissionStats };
