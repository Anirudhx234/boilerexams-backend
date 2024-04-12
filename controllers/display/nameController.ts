// Todo DEPRECATED - KEEP UNTIL WE KNOW WE DONT NEED TO REFERENCE THESE QUERIES

/*

// All topics for a specific course, no other relations
const getCourseTopics = async (req: Request, res: Response) => {
    const { c } = req.params;

    const course = await prisma.course.findUniqueOrThrow({
        where: Resolver.course(c),
        select: {
            topics: {
                orderBy: {
                    name: "asc"
                }
            }
        }
    });

    res.status(200).send(course.topics);
};

// All exams with question ids and numbers
const getCourseExamsWithBasicQuestionInfo = async (req: Request, res: Response) => {
    const { c } = req.params;

    const course = await prisma.course.findUniqueOrThrow({
        where: Resolver.course((c)),
        include: {
            exams: {
                include: {
                    questions: {
                        orderBy: {
                            number: "asc",
                        },
                    },
                },
            },
        }
    });

    if (!req.sendUnpublished && !course.flags.published) {
        throw new NotFoundError("Course not found");
    }

    const exams = course.exams.filter(exam => req.sendUnpublished || exam.flags.published);
    const sortedExams = _.orderBy(
        exams,
        [(exam) => (exam.number === 0 ? 10 : exam.number), "semester.year", "semester.season"],
        ["asc", "desc", "asc"],
    );

    res.status(200).send(sortedExams.map(exam => {
        return {
            ...exam,
            questions: exam.questions.filter(question => req.sendUnpublished || question.flags.published)
        };
    }));
};

// Basic question information for specific topic
const getCourseTopicWithBasicQuestionInfo = async (req: Request, res: Response) => {
    const { t, c } = req.params;

    const topic = await prisma.topic.findUniqueOrThrow({
        where: await Resolver.topic(t, c),
        include: {
            questions: {
                include: {
                    question: true
                },
                orderBy: {
                    number: "asc"
                },
            },
        },
    });

    res.status(200).send({
        ...topic,
        questions: Promise.all(topic.questions
            .map(relation => relation.question)
            .filter(question => req.sendUnpublished || question.flags.published)
        )
    });
};

// Full question information for specific topic
const getCourseTopicWithFullQuestionInfo = async (req: Request, res: Response) => {
    const { t, c } = req.params;

    const topic = await prisma.topic.findUniqueOrThrow({
        where: await Resolver.topic(t, c),
        include: {
            questions: {
                include: {
                    question: {
                        include: {
                            exam: true,
                            resources: true,
                            topics: {
                                include: {
                                    topic: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    number: "asc"
                },
            },
        },
    });

    if (!topic) {
        throw new NotFoundError("Topic not found");
    }

    res.status(200).send({
        ...topic,
        questions: await Promise.all(topic.questions
            .map(relation => relation.question)
            .filter(question => req.sendUnpublished || question.flags.published)
            .map(async (question) => {
                return {
                    ...question,
                    topics: question.topics.map(relation => relation.topic),
                }
            }))
    });
};

// All questions with id, number, and topics for an exam
const getCourseExamWithBasicQuestionInfo = async (req: Request, res: Response) => {
    const { e, c } = req.params;

    const exam = await prisma.exam.findUniqueOrThrow({
        where: await Resolver.exam(e, c),
        include: {
            questions: {
                include: {
                    topics: {
                        include: {
                            topic: true
                        }
                    }
                },
                orderBy: {
                    number: "asc"
                }
            }
        }
    });

    if (!req.sendUnpublished && !exam.flags.published) {
        throw new NotFoundError("Exam not found");
    }

    res.status(200).send({
        ...exam,
        questions: exam.questions
            .filter(question => req.sendUnpublished || question.flags.published)
            .map(question => {
                return {
                    ...question,
                    topics: question.topics.map(relation => relation.topic)
                };
            })
    });
};

// All questions for a specific exam, includes topics within questions.
const getCourseExamWithFullQuestionInfo = async (req: Request, res: Response) => {
    const { e, c } = req.params;

    const exam = await prisma.exam.findUniqueOrThrow({
        where: await Resolver.exam(e, c),
        include: {
            questions: {
                include: {
                    resources: true,
                    topics: {
                        include: {
                            topic: true
                        }
                    }
                },
                orderBy: {
                    number: "asc"
                }
            }
        }
    });

    if (!req.sendUnpublished && !exam.flags.published) {
        throw new NotFoundError("Exam not found");
    }

    res.status(200).send({
        ...exam,
        questions: await Promise.all(exam.questions
            .filter(question => req.sendUnpublished || question.flags.published)
            .map(async (question) => {
                return {
                    ...question,
                    topics: question.topics.map(relation => relation.topic),
                };
            }))
    });
};

 */
