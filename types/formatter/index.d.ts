interface FormatterOptions<T> {
    data: T;
    sendUnpublished?: boolean;
    permanentOnly?: boolean;
    prerender?: boolean;
}

interface FormattedCourse {
    subject?: string;
    flags: CourseFlags;
    exams?: FormattedExam[];
    topics?: FormattedTopic[];
    questions?: FormattedQuestion[];
}

interface FormattedCustomExam {
    flags: CustomExamFlags;
    course?: FormattedCourse;
    questions?: FormattedQuestion[];
    topics?: FormattedTopic[];
}

interface FormattedExam {
    flags: ExamFlags;
    number?: number;
    questions?: FormattedQuestion[];
}

interface FormattedTopic {
    name?: string;
    questions?: FormattedQuestion[];
}

interface FormattedQuestion {
    data?: unknown;
    course?: FormattedCourse;
    exam?: FormattedExam;
    flags: QuestionFlags;
    children?: FormattedQuestion[];
    topics?: FormattedTopic[];
    resources?: unknown[];
    answerChoices?: undefined;
}

interface FormattedAnswerChoice {
    body: string | null;
    question?: FormattedQuestion;
    renderedBody?: string;
    resources?: unknown[];
}

interface FormattedQuestionToTopic {
    topic?: FormattedTopic;
    question?: FormattedQuestion;
}

interface PotentialQuestionToTopic {
    topic?: PotentialTopic;
    question?: PotentialQuestion;
}

interface PotentialAnswerChoice {
    id?: string;
    body: string | null;
    question?: PotentialQuestion;
    resources?: unknown[];
}

interface PotentialQuestion {
    id?: string;
    type?: string;
    parentId?: string | null;
    course?: PotentialCourse;
    exam?: PotentialExam;
    flags: QuestionFlags;
    data?: unknown;
    children?: PotentialQuestion[];
    answerChoices?: PotentialAnswerChoice[];
    resources?: unknown[];
    topics?: PotentialQuestionToTopic[];
}

interface PotentialTopic {
    id?: string;
    name: string;
    questions?: PotentialQuestionToTopic[];
}

interface PotentialExam {
    id?: string;
    flags: ExamFlags;
    resources?: unknown[];
    questions?: PotentialQuestion[];
}

interface PotentialCustomExam {
    id?: string;
    flags: CustomExamFlags;
    course?: PotentialCourse;
    questions?: PotentialQuestion[];
}

interface PotentialCourse {
    id?: string;
    flags: CourseFlags;
    exams?: PotentialExam[];
    topics?: PotentialTopic[];
    questions?: PotentialQuestion[];
    resources?: unknown[];
}