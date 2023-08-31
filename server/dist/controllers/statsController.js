var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import prisma from "../libs/prisma.js";
import { NotFoundError } from '../middleware/errors/index.js';
import questionStats from '../helpers/stats/questionStats.js';
import examStats from '../helpers/stats/examStats.js';
import msToHMS from "../utils/msToHMS.js";
import answerChoiceStats from "../helpers/stats/answerChoiceStats.js";
const minimumValidSubmissionTime = 0;
const getGeneralStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    promises.push(prisma.course.aggregate({
        where: {
            published: true
        },
        _count: true
    }));
    promises.push(prisma.exam.aggregate({
        where: {
            published: true
        },
        _count: true
    }));
    promises.push(prisma.question.aggregate({
        where: {
            published: true
        },
        _count: true
    }));
    promises.push(prisma.submission.aggregate({
        where: {
            question: {
                published: true
            },
            timeSpent: {
                gte: minimumValidSubmissionTime
            }
        },
        _count: true,
        _sum: {
            timeSpent: true
        }
    }));
    const resolved = yield Promise.all(promises);
    const courses = resolved[0];
    const exams = resolved[1];
    const questions = resolved[2];
    const submissions = resolved[3];
    const totalTimeSpent = msToHMS(submissions._sum.timeSpent);
    const stats = {
        totalCourses: courses._count,
        totalExams: exams._count,
        totalQuestions: questions._count,
        totalSubmissions: submissions._count,
        totalTimeSpent: totalTimeSpent
    };
    res.status(200).json(stats);
});
const getCourseStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const promises = [];
    const course = yield prisma.course.findFirst({
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
    promises.push(prisma.submission.aggregate({
        where: {
            question: {
                courseId: courseId,
                published: true
            },
            timeSpent: {
                gte: minimumValidSubmissionTime
            }
        },
        _count: true,
        _sum: {
            timeSpent: true,
            timeSpentVideo: true,
        }
    }));
    promises.push(prisma.submission.aggregate({
        where: {
            question: {
                courseId: courseId,
                published: true
            },
            timeSpent: {
                gte: minimumValidSubmissionTime
            },
            correct: true
        },
        _count: true,
    }));
    const resolved = yield Promise.all(promises);
    const submissions = resolved[0];
    const correctSubmissions = resolved[1];
    const totalTimeSpent = msToHMS(submissions._sum.timeSpent);
    const totalVideoWatchTime = msToHMS(submissions._sum.timeSpentVideo);
    const courseStats = {
        totalExams: course._count.exams,
        totalQuestions: course._count.questions,
        totalTimeSpent: totalTimeSpent,
        totalVideoWatchTime: totalVideoWatchTime,
        totalSubmissions: submissions._count,
        totalCorrectSubmissions: correctSubmissions._count
    };
    res.status(200).json(courseStats);
});
const getCourseExamsStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const promises = [];
    const course = yield prisma.course.findFirst({
        where: {
            id: courseId,
            published: true
        },
        select: {
            exams: {
                where: {
                    published: true
                },
                select: {
                    id: true,
                    number: true,
                    semester: true
                }
            }
        }
    });
    if (!course) {
        throw new NotFoundError("Course not found");
    }
    const examsStats = [];
    for (const exam of course.exams) {
        promises.push(examStats(exam.id));
    }
    const resolved = yield Promise.all(promises);
    let i = 0;
    for (const exam of course.exams) {
        examsStats.push({ exam: exam, stats: resolved[i] });
        i++;
    }
    res.status(200).json(examsStats);
});
const getExamStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { examId } = req.params;
    const stats = yield examStats(examId);
    res.status(200).json(stats);
});
const getQuestionStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { questionId } = req.params;
    const mainStats = yield questionStats(questionId);
    const answerStats = yield answerChoiceStats(questionId);
    const stats = {
        questionStats: mainStats,
        answerChoiceStats: answerStats
    };
    res.status(200).json(stats);
});
const getSubmissionStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const submissions = yield prisma.submission.aggregate({
        where: {
            timeSpent: {
                gte: minimumValidSubmissionTime
            }
        },
        _sum: {
            timeSpent: true,
        },
        _avg: {
            timeSpent: true
        },
        _count: true
    });
    const correctSubmissions = yield prisma.submission.count({
        where: {
            correct: true,
            timeSpent: {
                gte: minimumValidSubmissionTime
            }
        }
    });
    const totalTimeSpent = msToHMS(submissions._sum.timeSpent);
    const averageTimeSpent = msToHMS(submissions._avg.timeSpent);
    const percentCorrect = 100.0 * (correctSubmissions / submissions._count);
    const submissionsStats = {
        totalSubmissions: submissions._count,
        totalTimeSpent: totalTimeSpent,
        averageTimeSpent: averageTimeSpent,
        percentCorrect: percentCorrect
    };
    res.status(200).json(submissionsStats);
});
export { getGeneralStats, getCourseExamsStats, getQuestionStats, getExamStats, getCourseStats, getSubmissionStats };
//# sourceMappingURL=statsController.js.map