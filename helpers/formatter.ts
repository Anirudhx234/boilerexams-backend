export default class Formatter {
    public static course(course: PotentialCourse, sendUnpublished: boolean) {
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

    public static exam(exam: PotentialExam, sendUnpublished: boolean) {
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

    public static topic(topic: PotentialTopic | undefined, sendUnpublished: boolean) {
        if (!topic) return undefined;
        return {
            ...topic,
            questions: Formatter.questionsToTopics(topic.questions, sendUnpublished)
                ?.map(relation => relation.questions)
        }
    }

    public static topics(topics: PotentialTopic[] | undefined, sendUnpublished: boolean) {
        if (!topics) return undefined;
        return topics.map(topic => Formatter.topic(topic, sendUnpublished));
    }

    public static question(question: PotentialQuestion | undefined, sendUnpublished: boolean) {
        if (!question) return undefined;
        return {
            ...question,
            children: Formatter.questions(question.children, sendUnpublished),
            topics: Formatter.questionsToTopics(question.topics, sendUnpublished)
                ?.map(relation => relation.topics)
        }
    }

    public static questions(questions: PotentialQuestion[] | undefined, sendUnpublished: boolean) {
        if (!questions) return undefined;
        return questions
            .filter(question => sendUnpublished || question.flags.published)
            .map(question => Formatter.question(question, sendUnpublished));
    }

    public static questionToTopic(relation: PotentialQuestionToTopic, sendUnpublished: boolean) {
        return {
            ...relation,
            topic: Formatter.topic(relation.topic, sendUnpublished),
            question: Formatter.question(relation.question, sendUnpublished)
        }
    }

    public static questionsToTopics(relations: PotentialQuestionToTopic[] | undefined, sendUnpublished: boolean) {
        if (!relations) return undefined;
        return relations.map(relation => Formatter.questionToTopic(relation, sendUnpublished));
    }
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

interface PotentialExam {
    flags:      ExamFlags
    questions?: PotentialQuestion[]
}

interface PotentialTopic {
    name:       string
    questions?: PotentialQuestionToTopic[]
}

interface PotentialCourse {
    flags:      CourseFlags
    subject?:   string
    exams?:     PotentialExam[]
    topics?:    PotentialTopic[]
    questions?: PotentialQuestion[]
}
