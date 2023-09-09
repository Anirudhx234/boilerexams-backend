declare const courseStats: (courseId: string) => Promise<{
    courseName: string;
    courseId: string;
    totalExams: number;
    totalQuestions: number;
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
    totalSubmissions: any;
    totalCorrectSubmissions: any;
}>;
export default courseStats;
