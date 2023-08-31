declare const examStats: (examId: string) => Promise<{
    totalTimeSpent: {
        hours: number;
        minutes: number;
        seconds: number;
    };
    totalVideoWatchTime: {
        hours: number;
        minutes: number;
        seconds: number;
    };
    totalSubmissions: number;
    totalCorrectSubmissions: number;
}>;
export default examStats;
