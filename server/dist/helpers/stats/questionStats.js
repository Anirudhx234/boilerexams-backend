var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import prisma from "../../libs/prisma.js";
const questionStats = (questionId) => __awaiter(void 0, void 0, void 0, function* () {
    const submissions = yield prisma.submission.aggregate({
        where: {
            questionId: questionId
        },
        _sum: {
            timeSpent: true,
            timeSpentVideo: true,
        },
        _count: true,
    });
    const timeSpent = submissions._sum.timeSpent;
    const timeSpentVideo = submissions._sum.timeSpentVideo;
    const submissionTotal = submissions._count;
    const submissionCorrect = yield prisma.submission.count({
        where: {
            questionId: questionId,
            correct: true
        }
    });
    return { timeSpent, timeSpentVideo, submissionTotal, submissionCorrect };
});
export default questionStats;
//# sourceMappingURL=questionStats.js.map