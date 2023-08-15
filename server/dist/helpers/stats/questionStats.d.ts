declare const questionStats: (questionId: string) => Promise<{
    timeSpent: number | null;
    timeSpentVideo: number | null;
    submissionTotal: number;
    submissionCorrect: number;
}>;
export default questionStats;
