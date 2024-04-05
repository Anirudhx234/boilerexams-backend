import { JsonValue } from "@prisma/client/runtime/library.js";
import { APIError } from "../middleware/errors/index.js";
import { QuestionData } from "../prisma/schema.js";

export default class Formatter {
    public static async course(options: FormatterOptions<PotentialCourse>): Promise<FormattedCourse> {
        return {
            ...options.data,
            exams: await Formatter.exams({ ...options, data: options.data.exams }),
            topics: await Formatter.topics({ ...options, data: options.data.topics }),
            questions: await Formatter.questions({ ...options, data: options.data.questions }),
            stats: options.computeStats ? await options.data.stats : undefined
        };
    }

    public static courses(options: FormatterOptions<PotentialCourse[] | undefined>) {
        if (!options.data) return undefined
        return Promise.all(options.data
            .filter(course => options.sendUnpublished || course.flags.published)
            .map(course => Formatter.course({ ...options, data: course })));
    }

    public static async exam(options: FormatterOptions<PotentialExam>): Promise<FormattedExam> {
        return {
            ...options.data,
            questions: await Formatter.questions({ ...options, data: options.data?.questions }),
            stats: options.computeStats ? await options.data.stats : undefined
        }
    }

    public static async exams(options: FormatterOptions<PotentialExam[] | undefined>) {
        if (!options.data) return undefined;
        return await Promise.all(options.data
            .filter(exam => options.sendUnpublished || exam.flags.published, options.computeStats)
            .map(async exam => await Formatter.exam({ ...options, data: exam })));
    }

    public static async topic(options: FormatterOptions<PotentialTopic>): Promise<FormattedTopic> {
        const questions = await Formatter.questionsToTopics({ ...options, data: options.data.questions });
        return {
            ...options.data,
            questions: questions
                ?.map(relation => relation.question)
                ?.filter(question => question) as FormattedQuestion[]
        }
    }

    public static async topics(options: FormatterOptions<PotentialTopic[] | undefined>) {
        if (!options.data) return undefined;
        return await Promise.all(options.data.map(async topic => await Formatter.topic({ ...options, data: topic })));
    }

    public static async question(options: FormatterOptions<PotentialQuestion>): Promise<FormattedQuestion> {

        const topics = await Formatter.questionsToTopics({ ...options, data: options.data.topics});
        return {
            ...options.data,
            data: {
                ...(options.data.data as object),
                explanationText: undefined, // ToDo temporary fix
                answerChoices: options.data.answerChoices
            },
            answerChoices: undefined,
            children: await Formatter.questions({ ...options, data: options.data.children }),
            stats: options.computeStats ? await options.data.stats : undefined,
            topics: topics
                ?.map(relation => relation.topic)
                ?.filter(topic => topic) as FormattedTopic[]
        }
    }

    public static async questions(options: FormatterOptions<PotentialQuestion[] | undefined>) {
        if (!options.data) return undefined;
        return await Promise.all(options.data
            .filter(question => options.sendUnpublished || question.flags.published)
            .map(async question => await Formatter.question({ ...options, data: question })));
    }

    public static async questionToTopic(options: FormatterOptions<PotentialQuestionToTopic>): Promise<FormattedQuestionToTopic> {
        return {
            ...options.data,
            topic: options.data.topic ? await Formatter.topic({ ...options, data: options.data.topic }) : undefined,
            question: options.data.question? await Formatter.question({ ...options, data: options.data.question }) : undefined
        }
    }

    public static async questionsToTopics(options: FormatterOptions<PotentialQuestionToTopic[] | undefined>) {
        if (!options.data) return undefined;
        return await Promise.all(options.data.map(async relation => await Formatter.questionToTopic({ ...options, data: relation})));
    }
}

interface FormatterOptions<T> {
    data: T,
    sendUnpublished: boolean,
    computeStats: boolean
}

interface FormattedCourse {
    flags:      CourseFlags
    subject?:   string
    exams?:     FormattedExam[]
    topics?:    FormattedTopic[]
    questions?: FormattedQuestion[]
    stats?:     CourseStats
}

interface FormattedExam {
    flags:      ExamFlags
    questions?: FormattedQuestion[]
    stats?:     ExamStats
}

interface FormattedTopic {
    name:       string
    questions?: FormattedQuestion[]
}

interface FormattedQuestion {
    data?:          object
    flags:          QuestionFlags
    number?:        number
    answerChoices:  undefined
    children?:      FormattedQuestion[]
    topics?:        FormattedTopic[]
    stats?:         QuestionStats
}

interface FormattedQuestionToTopic {
    topic?:     FormattedTopic
    question?:  FormattedQuestion
}

interface PotentialQuestionToTopic {
    number?:    number,
    topic?:     PotentialTopic
    question?:  PotentialQuestion
}

interface PotentialQuestion {
    data?:          JsonValue
    flags:          QuestionFlags
    number?:        number,
    children?:      PotentialQuestion[]
    answerChoices?: object[]
    topics?:        PotentialQuestionToTopic[]
    stats?:         Promise<QuestionStats>
}

interface PotentialTopic {
    name:       string
    questions?: PotentialQuestionToTopic[]
}

interface PotentialExam {
    flags:      ExamFlags
    questions?: PotentialQuestion[]
    stats?:     Promise<ExamStats>
}

interface PotentialCourse {
    flags:      CourseFlags
    exams?:     PotentialExam[]
    topics?:    PotentialTopic[]
    questions?: PotentialQuestion[]
    stats?:     Promise<CourseStats>
}
