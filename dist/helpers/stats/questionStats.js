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
import msToHMS from "../../utils/msToHMS.js";
const minimumValidSubmissionTime = 0;
const questionStats = (questionId) => __awaiter(void 0, void 0, void 0, function* () {
    const submissions = yield prisma.submission.aggregate({
        where: {
            question: {
                id: questionId,
                published: true
            },
            timeSpent: {
                gte: minimumValidSubmissionTime
            }
        },
        _sum: {
            timeSpent: true,
            timeSpentVideo: true,
        },
        _count: true,
    });
    const correctSubmissions = yield prisma.submission.count({
        where: {
            question: {
                id: questionId,
                published: true
            },
            timeSpent: {
                gte: minimumValidSubmissionTime
            },
            correct: true
        }
    });
    const totalTimeSpent = msToHMS(submissions._sum.timeSpent);
    const totalVideoWatchTime = msToHMS(submissions._sum.timeSpentVideo);
    const questionStats = {
        totalTimeSpent: totalTimeSpent,
        totalVideoWatchTime: totalVideoWatchTime,
        totalSubmissions: submissions._count,
        totalCorrectSubmissions: correctSubmissions
    };
    return questionStats;
});
export default questionStats;
//# sourceMappingURL=questionStats.js.map