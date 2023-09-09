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
const answerChoiceStats = (questionId) => __awaiter(void 0, void 0, void 0, function* () {
    const submissions = yield prisma.submission.findMany({
        where: {
            questionId: questionId
        }
    });
    const totalAnswerChoices = yield prisma.answerChoice.count({
        where: {
            questionId: questionId
        }
    });
    const answerStats = new Array(totalAnswerChoices).fill(0);
    submissions.forEach((submission) => {
        for (const index of submission.selectedChoiceIndices) {
            answerStats[index] += 1;
        }
    });
    return answerStats;
});
export default answerChoiceStats;
//# sourceMappingURL=answerChoiceStats.js.map