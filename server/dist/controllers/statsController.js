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
const getQuestionStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { questionId } = req.params;
    const timeStats = yield questionStats(questionId);
    const question = yield prisma.question.findUnique({
        where: {
            id: questionId
        },
        select: {
            answerChoices: true
        }
    });
    if (!question) {
        throw new NotFoundError("Question not found");
    }
    const len = question.answerChoices.length;
    const answerStats = [];
    for (let i = 0; i < len; i++) {
        const counted = yield prisma.submission.count({
            where: {
                questionId: questionId,
                selectedChoiceIndices: {
                    has: i
                }
            }
        });
        answerStats.push(counted);
    }
    res.status(200).send({ timeStats, answerStats });
});
const getExamStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { examId } = req.params;
    const obj = yield examStats(examId);
    res.status(200).send(obj);
});
const getCourseStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const course = yield prisma.course.findUnique({
        where: {
            id: courseId
        },
        select: {
            exams: {
                select: {
                    id: true
                }
            }
        }
    });
    if (!course) {
        throw new NotFoundError("Course not found");
    }
    const ids = course.exams.map(q => q.id);
    const obj = { timeSpent: 0, timeSpentVideo: 0, submissionTotal: 0, submissionCorrect: 0 };
    const keys = Object.keys(obj);
    for (let x = 0; x < ids.length; x++) {
        const tempStats = Object.values(yield examStats(ids[x]));
        for (let i = 0; i < tempStats.length; i++) {
            obj[keys[i]] += tempStats[i];
        }
    }
    res.status(200).send(obj);
});
const getSubmissionStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validTime = 0;
    const times = yield prisma.submission.aggregate({
        _sum: {
            timeSpent: true
        },
        _avg: {
            timeSpent: true
        },
        _count: true,
        where: {
            timeSpent: {
                gte: validTime
            }
        },
    });
    const timeSpent = times._sum.timeSpent;
    const avgTime = times._avg.timeSpent;
    const submissionTotal = times._count;
    const totalCorrect = yield prisma.submission.count({
        where: {
            correct: true,
            timeSpent: {
                gte: validTime
            }
        }
    });
    const percentCorrect = 100.0 * (totalCorrect / submissionTotal);
    res.status(200).send({ submissionTotal, timeSpent, avgTime, percentCorrect });
});
export { getQuestionStats, getExamStats, getCourseStats, getSubmissionStats };
//# sourceMappingURL=statsController.js.map