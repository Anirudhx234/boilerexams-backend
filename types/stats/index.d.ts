type QuestionQueryData = {
    id: string;
    courseId: string;
    totalTimeSpent: number;
    totalTimeSpentVideo: number;
    totalSubmissions: number;
    totalSubmissionsCorrect: number;
    topicIds: string[];
    topicNames: string[];
};

type CourseQueryData = {
    id: string;
    name: string;
    abbreviation: string;
    totalExams: number;
    totalQuestions: number;
    totalTimeSpent: number;
    totalTimeSpentVideo: number;
    totalSubmissions: number;
    totalSubmissionsCorrect: number;
};

type CourseMapData = {
    id: string;
    questionStats: QuestionQueryData[];
};

type TimedSubmissionQueryData = {
    submission_hour: Date;
    submissions_count: number;
};