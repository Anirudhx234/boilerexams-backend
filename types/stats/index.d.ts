interface AnswerChoiceStats {
    count:  number
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

interface ExamStats extends QuestionStats {
    questions:          number;
}

interface CourseStats extends ExamStats {
    exams:              number;
}

interface GeneralQuestionStats extends QuestionStats {
    total:  number;
}


interface GeneralExamStats extends ExamStats {
    total:  number;
}

interface GeneralCourseStats extends CourseStats {
    total:  number;
}

type CourseMapData = {
    id: string;
    questionStats: QuestionStats[];
};
