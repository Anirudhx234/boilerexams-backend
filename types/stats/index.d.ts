interface CourseStatsOptions {
    before: Date;
    after: Date;
    sort: string;
    skip: number;
    limit?: number;
    id?: string;
}

interface ExamStatsOptions extends CourseStatsOptions {
    courseId?: string;
}

interface TopicStatsOptions extends CourseStatsOptions {
    courseId?: string;
}

interface QuestionStatsOptions extends ExamStatsOptions {
    examId?: string;
    topicId?: string;
}

interface SubmissionStatsOptions extends QuestionStatsOptions {
    questionId?: string;
}

interface AnswerChoiceStatsOptions extends CourseStatsOptions {
    questionId?: string;
}
