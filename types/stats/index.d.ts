interface AnswerChoiceStats {
    count: number
}

interface SubmissionStats {
    count:          number;
    timeSpent:      bigint;
    timeSpentVideo: bigint;
}

interface QuestionStats extends SubmissionStats {
    submissions:        number;
    submissionsCorrect: number;
}

interface ExamOrTopicStats extends QuestionStats {
    questions:          number;
}

interface CourseStats extends ExamOrTopicStats {
    exams:              number;
}

type CourseMapData = {
    id: string;
    questionStats: QuestionStats[];
};
