export default class Formatter {
    public static course(course: PotentialCourse, sendUnpublished: boolean): FormattedCourse {
        return {
            ...course,
            exams: Formatter.exams(course.exams, sendUnpublished),
            topics: Formatter.topics(course.topics, sendUnpublished),
            questions: Formatter.questions(course.questions, sendUnpublished)
        };
    }

    public static courses(courses: PotentialCourse[] | undefined, sendUnpublished: boolean) {
        if (!courses) return undefined
        return courses
            .filter(course => sendUnpublished || course.flags.published)
            .map(course => Formatter.course(course, sendUnpublished));
    }

    public static exam(exam: PotentialExam, sendUnpublished: boolean): FormattedExam {
        return {
            ...exam,
            questions: Formatter.questions(exam.questions, sendUnpublished)
        }
    }

    public static exams(exams: PotentialExam[] | undefined, sendUnpublished: boolean) {
        if (!exams) return undefined;
        return exams
            .filter(exam => sendUnpublished || exam.flags.published)
            .map(exam => Formatter.exam(exam, sendUnpublished));
    }

    public static topic(topic: PotentialTopic, sendUnpublished: boolean): FormattedTopic {
        return {
            ...topic,
            questions: Formatter.questionsToTopics(topic.questions, sendUnpublished)
                ?.map(relation => relation.question)
                ?.filter(question => question) as FormattedQuestion[]
        }
    }

    public static topics(topics: PotentialTopic[] | undefined, sendUnpublished: boolean) {
        if (!topics) return undefined;
        return topics.map(topic => Formatter.topic(topic, sendUnpublished));
    }

    public static question(question: PotentialQuestion, sendUnpublished: boolean): FormattedQuestion {
        return {
            ...question,
            children: Formatter.questions(question.children, sendUnpublished),
            topics: Formatter.questionsToTopics(question.topics, sendUnpublished)
                ?.map(relation => relation.topic)
                ?.filter(topic => topic) as FormattedTopic[]
        }
    }

    public static questions(questions: PotentialQuestion[] | undefined, sendUnpublished: boolean) {
        if (!questions) return undefined;
        return questions
            .filter(question => sendUnpublished || question.flags.published)
            .map(question => Formatter.question(question, sendUnpublished));
    }

    public static questionToTopic(relation: PotentialQuestionToTopic, sendUnpublished: boolean): FormattedQuestionToTopic {
        return {
            ...relation,
            topic: relation.topic ? Formatter.topic(relation.topic, sendUnpublished) : undefined,
            question: relation.question? Formatter.question(relation.question, sendUnpublished) : undefined
        }
    }

    public static questionsToTopics(relations: PotentialQuestionToTopic[] | undefined, sendUnpublished: boolean) {
        if (!relations) return undefined;
        return relations.map(relation => Formatter.questionToTopic(relation, sendUnpublished));
    }
}

interface FormattedCourse {
    flags:      CourseFlags
    exams?:     FormattedExam[]
    topics?:    FormattedTopic[]
    questions?: FormattedQuestion[]
}

interface FormattedExam {
    flags:      ExamFlags
    questions?: FormattedQuestion[]
}

interface FormattedTopic {
    name:       string
    questions?: FormattedQuestion[]
}

interface FormattedQuestion {
    flags:      QuestionFlags
    children?:  FormattedQuestion[]
    topics?:    FormattedTopic[]
}

interface FormattedQuestionToTopic {
    topic?:     FormattedTopic
    question?:  FormattedQuestion
}



interface PotentialQuestionToTopic {
    topic?:    PotentialTopic
    question?: PotentialQuestion
}

interface PotentialQuestion {
    flags:          QuestionFlags
    children?:      PotentialQuestion[]
    topics?:        PotentialQuestionToTopic[]
}

interface PotentialTopic {
    name:       string
    questions?: PotentialQuestionToTopic[]
}

interface PotentialExam {
    flags:      ExamFlags
    questions?: PotentialQuestion[]
}

interface PotentialCourse {
    flags:      CourseFlags
    exams?:     PotentialExam[]
    topics?:    PotentialTopic[]
    questions?: PotentialQuestion[]
}
