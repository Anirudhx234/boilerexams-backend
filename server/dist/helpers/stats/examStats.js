var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PrismaClient } from '@prisma/client';
import { NotFoundError } from "../../middleware/errors/index.js";
import questionStats from "./questionStats.js";
const prisma = new PrismaClient();
const examStats = (examId) => __awaiter(void 0, void 0, void 0, function* () {
    const exam = yield prisma.exam.findUnique({
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
    });
    if (!exam) {
        throw new NotFoundError("Exam not found");
    }
    const ids = exam.questions.map(q => q.id);
    const obj = { timeSpent: 0, timeSpentVideo: 0, submissionTotal: 0, submissionCorrect: 0 };
    const keys = Object.keys(obj);
    for (let x = 0; x < ids.length; x++) {
        const tempStats = Object.values(yield questionStats(ids[x]));
        for (let i = 0; i < tempStats.length; i++) {
            obj[keys[i]] += tempStats[i];
        }
    }
    return obj;
});
export default examStats;
//# sourceMappingURL=examStats.js.map