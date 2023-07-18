import { PrismaClient } from '@prisma/client';
import _ from 'lodash'
import { NotFoundError } from '../middleware/errors';
import questionStats from '../helpers/stats/questionStats';
import examStats from '../helpers/stats/examStats';
const prisma = new PrismaClient();


const getQuestionStats = async (req, res) => {
    const { questionId } = req.params
    const timeStats = await questionStats(questionId)
    const question = await prisma.question.findUnique({
        where: {
            id: questionId
        },
        select: {
            answerChoices: true
        }
    })
    if (!question) {
        throw new NotFoundError("Question not found")
    }
    const len = question.answerChoices.length
    const answerStats: number[] = []
    for (let i = 0; i < len; i++) {
        const counted = await prisma.submission.count({
            where: {
                questionId: questionId,
                selectedChoiceIndices: {
                    has: i
                }
            }
        })
        answerStats.push(counted)
    }
    res.status(200).send({ timeStats, answerStats })
}

const getExamStats = async (req, res) => {
    const { examId } = req.params
    const obj = await examStats(examId)
    res.status(200).send(obj)
}

const getCourseStats = async (req, res) => {
    const { courseId } = req.params
    const course = await prisma.course.findUnique({
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
    })
    if (!course) {
        throw new NotFoundError("Course not found")
    }
    const ids = course.exams.map(q => q.id)

    const obj = { timeSpent: 0, timeSpentVideo: 0, submissionTotal: 0, submissionCorrect: 0 };
    const keys = Object.keys(obj)
    for (let x = 0; x < ids.length; x++) {
        const tempStats = Object.values(await examStats(ids[x]))
        for (let i = 0; i < tempStats.length; i++) {
            obj[keys[i]] += tempStats[i]
        }
    }
    res.status(200).send(obj)
}

const getSubmissionStats = async (req, res) => {
    const validTime = 0
    const times = await prisma.submission.aggregate({
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
    })
    const timeSpent = times._sum.timeSpent
    const avgTime = times._avg.timeSpent
    const submissionTotal = times._count
    const totalCorrect = await prisma.submission.count({
        where: {
            correct: true,
            timeSpent: {
                gte: validTime
            }
        }
    })

    const percentCorrect = 100.0 * (totalCorrect / submissionTotal)
    res.status(200).send({ submissionTotal, timeSpent, avgTime, percentCorrect })
}

export {
    getQuestionStats,
    getExamStats,
    getCourseStats,
    getSubmissionStats
}