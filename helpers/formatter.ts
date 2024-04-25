import { JsonValue } from "@prisma/client/runtime/library.js";

export default class Formatter {
    public static course(options: FormatterOptions<PotentialCourse>): FormattedCourse {
        return {
            ...options.data,
            exams: Formatter.exams({ ...options, data: options.data.exams }),
            topics: Formatter.topics({ ...options, data: options.data.topics }),
            questions: Formatter.questions({ ...options, data: options.data.questions }),
        };
    }

    public static courses(options: FormatterOptions<PotentialCourse[] | undefined>) {
        if (!options.data) return undefined;
        return options.data
            .filter((course) => options.sendUnpublished || course.flags.published)
            .map((course) => Formatter.course({ ...options, data: course }));
    }

    public static exam(options: FormatterOptions<PotentialExam>): FormattedExam {
        return {
            ...options.data,
            questions: Formatter.questions({ ...options, data: options.data?.questions }),
        };
    }

    public static exams(options: FormatterOptions<PotentialExam[] | undefined>) {
        if (!options.data) return undefined;
        return options.data
            .filter((exam) => options.sendUnpublished || exam.flags.published)
            .map((exam) => Formatter.exam({ ...options, data: exam }));
    }

    public static topic(options: FormatterOptions<PotentialTopic>): FormattedTopic {
        const questions = Formatter.questionsToTopics({ ...options, data: options.data.questions });
        return {
            ...options.data,
            questions: questions?.map((relation) => relation.question)?.filter((question) => question) as FormattedQuestion[],
        };
    }

    public static topics(options: FormatterOptions<PotentialTopic[] | undefined>) {
        if (!options.data) return undefined;
        return options.data.map((topic) => Formatter.topic({ ...options, data: topic }));
    }

    public static question(options: FormatterOptions<PotentialQuestion>): FormattedQuestion {
        const topics = Formatter.questionsToTopics({ ...options, data: options.data.topics });
        return {
            ...options.data,
            data: options.data.data
                ? {
                      ...(options.data.data as object),
                      explanationText: undefined, // ToDo temporary fix
                      answerChoices: Formatter.answerChoices({ ...options, data: options.data.answerChoices }),
                  }
                : undefined,
            course: options.data.course ? Formatter.course({ ...options, data: options.data.course }) : undefined,
            exam: options.data.exam ? Formatter.exam({ ...options, data: options.data.exam }) : undefined,
            answerChoices: undefined,
            resources: options.data.resources,
            children: Formatter.questions({ ...options, data: options.data.children }),
            topics: topics?.map((relation) => relation.topic)?.filter((topic) => topic) as FormattedTopic[],
        };
    }

    public static questions(options: FormatterOptions<PotentialQuestion[] | undefined>) {
        if (!options.data) return undefined;
        return options.data
            .filter((question) => options.sendUnpublished || question.flags.published)
            .map((question) => Formatter.question({ ...options, data: question }));
    }

    public static answerChoice(options: FormatterOptions<PotentialAnswerChoice>): FormattedAnswerChoice {
        return {
            ...options.data,
            question: options.data.question ? Formatter.question({ ...options, data: options.data.question }) : undefined,
        };
    }

    public static answerChoices(options: FormatterOptions<PotentialAnswerChoice[] | undefined>) {
        if (!options.data) return undefined;
        return options.data.map((answerChoice) => Formatter.answerChoice({ ...options, data: answerChoice }));
    }

    public static questionToTopic(options: FormatterOptions<PotentialQuestionToTopic>): FormattedQuestionToTopic {
        return {
            ...options.data,
            topic: options.data.topic ? Formatter.topic({ ...options, data: options.data.topic }) : undefined,
            question: options.data.question ? Formatter.question({ ...options, data: options.data.question }) : undefined,
        };
    }

    public static questionsToTopics(options: FormatterOptions<PotentialQuestionToTopic[] | undefined>) {
        if (!options.data) return undefined;
        return options.data
            .map((relation) => Formatter.questionToTopic({ ...options, data: relation }))
            .filter((relation) => options.sendUnpublished || relation.question?.flags.published);
    }
}

interface FormatterOptions<T> {
    data: T;
    sendUnpublished: boolean;
}

interface FormattedCourse {
    subject?: string;
    flags: CourseFlags;
    exams?: FormattedExam[];
    topics?: FormattedTopic[];
    questions?: FormattedQuestion[];
}

interface FormattedExam {
    flags: ExamFlags;
    number?: number;
    questions?: FormattedQuestion[];
}

interface FormattedTopic {
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
    question?: FormattedQuestion;
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
    question?: PotentialQuestion;
    resources?: unknown[];
}

interface PotentialQuestion {
    id?: string;
    parentId?: string | null;
    course?: PotentialCourse;
    exam?: PotentialExam;
    flags: QuestionFlags;
    data?: JsonValue;
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

interface PotentialCourse {
    id?: string;
    flags: CourseFlags;
    exams?: PotentialExam[];
    topics?: PotentialTopic[];
    questions?: PotentialQuestion[];
    resources?: unknown[];
}
