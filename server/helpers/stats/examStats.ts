import prisma from "../../libs/prisma.js";
import { NotFoundError } from "../../middleware/errors/index.js";
import questionStats from "./questionStats.js";

const examStats = async (examId: string) => {
    const exam = await prisma.exam.findUnique({
        where: {
            id: examId
        },
        select: {
            questions: {
                select: {
                    id: true
                }
            }
        }
    })
    if (!exam) {
        throw new NotFoundError("Exam not found")
    }
    const ids = exam.questions.map(q => q.id)

    const obj = { timeSpent: 0, timeSpentVideo: 0, submissionTotal: 0, submissionCorrect: 0 };
    const keys = Object.keys(obj)
    for (let x = 0; x < ids.length; x++) {
        const tempStats = Object.values(await questionStats(ids[x]))
        for (let i = 0; i < tempStats.length; i++) {
            obj[keys[i]] += tempStats[i]
        }
    }
    return obj
}

export default examStats