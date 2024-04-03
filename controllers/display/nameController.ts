import prisma from "../../libs/prisma.js";
import { NotFoundError } from "../../middleware/errors/index.js";
import type { Request, Response } from "express";
import _ from "lodash";
import Resolver from "../../helpers/resolver.js";


// All topics metadata, no relations
const getAllTopics = async (req: Request, res: Response) => {
    const topics = await prisma.topic.findMany();

    if (topics.length < 1) {
        throw new NotFoundError("No topics found");
    }

    res.status(200).send(topics);
};

// All topics for a specific course, no other relations
const getCourseTopics = async (req: Request, res: Response) => {
    const { courseResolvable } = req.params;

    const course = await prisma.course.findUniqueOrThrow({
        where: Resolver.course(courseResolvable),
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

// All questions with topics included for a specific topic in a course.
// Includes questions from other courses.
const getCourseTopicsWithBasicQuestionInfo = async (req: Request, res: Response) => {
    const { courseResolvable } = req.params;

    const course = await prisma.course.findUniqueOrThrow({
        where: Resolver.course(courseResolvable),
        select: {
            flags: true,
            topics: {
                include: {
                    questions: {
                        include: {
                            question: {
                                select: {
                                    id: true,
                                    number: true,
                                    flags: true,
                                }
                            }
                        },
                        orderBy: {
                            number: "asc"
                        }
                    }
                },
                orderBy: {
                    name: "asc",
                },
            }
        },
    });

    if (course.flags.published) {
        throw new NotFoundError("Course not found");
    }

    res.status(200).send({
        ...course,
        topics: course.topics.map(topic => {
            return {
                ...topic,
                questions: topic.questions
                    .map(relation => relation.question)
                    .filter(question => question.flags.published)
            };
        })
    });
};

// All exams with question ids and numbers
const getCourseExamsWithBasicQuestionInfo = async (req: Request, res: Response) => {
    const { courseResolvable } = req.params;

    const course = await prisma.course.findUniqueOrThrow({
        where: Resolver.course((courseResolvable)),
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

    if (course.flags.published) {
        throw new NotFoundError("Course not found");
    }

    const exams = course.exams.filter(exam => exam.flags.published);

    const sortedExams = _.orderBy(
        exams,
        [(exam) => (exam.number === 0 ? 10 : exam.number), "semester.year", "semester.season"],
        ["asc", "desc", "asc"],
    );

    res.status(200).send(sortedExams.map(exam => {
        return {
            ...exam,
            questions: exam.questions.filter(question => question.flags.published)
        };
    }));
};

// Basic question information for specific topic
const getCourseTopicWithBasicQuestionInfo = async (req: Request, res: Response) => {
    const { topicResolvable, courseResolvable } = req.params;

    const topic = await prisma.topic.findUniqueOrThrow({
        where: await Resolver.topic(topicResolvable, courseResolvable),
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
            .filter(question => question.flags.published)
        )
    });
};

// Full question information for specific topic
const getCourseTopicWithFullQuestionInfo = async (req: Request, res: Response) => {
    const { topicResolvable, courseResolvable } = req.params;

    const topic = await prisma.topic.findUniqueOrThrow({
        where: await Resolver.topic(topicResolvable, courseResolvable),
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
            .filter(question => question.flags.published)
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
    const { examResolvable, courseResolvable } = req.params;

    const exam = await prisma.exam.findUniqueOrThrow({
        where: await Resolver.exam(examResolvable, courseResolvable),
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

    if (!exam.flags.published) {
        throw new NotFoundError("Exam not found");
    }

    res.status(200).send({
        ...exam,
        questions: exam.questions
            .filter(question => question.flags.published)
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
    const { examResolvable, courseResolvable } = req.params;

    const exam = await prisma.exam.findUniqueOrThrow({
        where: await Resolver.exam(examResolvable, courseResolvable),
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

    if (exam.flags.published) {
        throw new NotFoundError("Exam not found");
    }

    res.status(200).send({
        ...exam,
        questions: await Promise.all(exam.questions
            .filter(question => question.flags.published)
            .map(async (question) => {
                return {
                    ...question,
                    topics: question.topics.map(relation => relation.topic),
                };
            }))
    });
};

export {
    getAllTopics,
    getCourseTopics,
    getCourseTopicsWithBasicQuestionInfo,
    getCourseExamsWithBasicQuestionInfo,
    getCourseTopicWithBasicQuestionInfo,
    getCourseTopicWithFullQuestionInfo,
    getCourseExamWithBasicQuestionInfo,
    getCourseExamWithFullQuestionInfo,
};