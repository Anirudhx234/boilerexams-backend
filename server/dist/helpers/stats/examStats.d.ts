declare const examStats: (examId: string) => Promise<{
    timeSpent: number;
    timeSpentVideo: number;
    submissionTotal: number;
    submissionCorrect: number;
}>;
export default examStats;
