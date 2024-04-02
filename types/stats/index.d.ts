interface SubmissionStats {
    timeSpent:      bigint;
    timeSpentVideo: bigint;
}

interface QuestionStats extends SubmissionStats {
    submissions:        number;
    submissionsCorrect: number;
}

interface ExamStats {
    questions:          number;
}

interface CourseStats extends QuestionStats {
    exams:              number;
}

type CourseMapData = {
    id: string;
    questionStats: QuestionStats[];
};
