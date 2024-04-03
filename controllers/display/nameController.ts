import prisma from "../../libs/prisma.js";
import { NotFoundError } from "../../middleware/errors/index.js";
import type { Request, Response } from "express";
import _ from "lodash";
import Resolver from "../../helpers/resolver.js";
import { questionStats } from "../../helpers/stats/questionStats.js";
import { Epoch } from "../../prisma/schema.js";
import FlagDecoder from "../../helpers/decoder.js";

const questionSort: QuestionSortCategory[] = [
    {
        exam: {
            year: "desc"
        },
    },
    {
        exam: {
            season: "asc",
        },
    },
    {
        exam: {
            number: "asc",
        },
    },
    {
        number: "asc",
    },
];

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

    const decodedCourseFlags = FlagDecoder.course(course.flags);
    if (!decodedCourseFlags.published) {
        throw new NotFoundError("Course not found");
    }

    res.status(200).send({
        ...course,
        topics: course.topics.map(topic => {
            return {
                ...topic,
                questions: topic.questions
                    .map(relation => {
                        const decodedQuestionFlags = FlagDecoder.question(relation.question.flags);
                        return decodedQuestionFlags.published ? relation.question : null;
                    })
                    .filter(question => question !== null)
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

    const decodedCourseFlags = FlagDecoder.course(course.flags);
    if (!decodedCourseFlags.published) {
        throw new NotFoundError("Course not found");
    }

    const exams = course.exams.map(exam => {
        const decodedExamFlags = FlagDecoder.exam(exam.flags);
        if (!decodedExamFlags.published) {
            return null;
        }
        return {
            ...exam,
            questions: exam.questions.filter(question => {
                const decodedQuestionFlags = FlagDecoder.question(question.flags);
                return decodedQuestionFlags.published;
            })
        };
    }).filter(exam => exam !== null);

    const sortedExams = _.orderBy(
        exams,
        [(exam) => (exam?.number === 0 ? 10 : exam?.number), "semester.year", "semester.season"],
        ["asc", "desc", "asc"],
    );

    res.status(200).send(sortedExams);
};


// Basic question information for specific topic
const getCourseTopicWithBasicQuestionInfo = async (req: Request, res: Response) => {
    const { topicResolvable, courseResolvable } = req.params;

    const topic = await prisma.topic.findUniqueOrThrow({
        where: await Resolver.topic(topicResolvable, courseResolvable),
        include: {
            questions: {
                include: {
                    question: true,
                },
                orderBy: questionSort,
            },
        },
    });

    const questionsWithStats = await Promise.all(topic.questions.map(async (relation) => {
        const decodedFlags = FlagDecoder.question(relation.question.flags);
        // Filter based on the published property of the decoded flags
        if (!decodedFlags.published) {
            return null; 
        }

        const stats = await questionStats(new Date(), Epoch);
        return {
            ...relation.question,
            answerChoiceStats: stats
        };
    }));

    const filteredQuestionsWithStats = questionsWithStats.filter(question => question !== null);

    res.status(200).send({
        ...topic,
        questions: filteredQuestionsWithStats
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
                orderBy: questionSort,
            },
        },
    });

    if (!topic) {
        throw new NotFoundError("Topic not found");
    }
    const questionsWithStats = await Promise.all(topic.questions.map(async (relation) => {
        const decodedFlags = FlagDecoder.question(relation.question.flags);
        // Filter based on the published property of the decoded flags
        if (!decodedFlags.published) {
            return null; 
        }

        const stats = await questionStats(new Date(), Epoch);
        return {
            ...relation.question,
            questionStats: stats
        };
    }));

    const filteredQuestionsWithStats = questionsWithStats.filter(question => question !== null);

    res.status(200).send({
        ...topic,
        questions: filteredQuestionsWithStats
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

    const decodedExamFlags = FlagDecoder.exam(exam.flags);
    if (!decodedExamFlags.published) {
        throw new NotFoundError("Exam not found");
    }

    const processedQuestions = exam.questions.map(question => {
        const decodedQuestionFlags = FlagDecoder.question(question.flags);

        if (!decodedQuestionFlags.published) {
            return null; 
        }
        return {
            ...question,
            topics: question.topics.map(relation => relation.topic)
        };
    }).filter(question => question !== null);
    res.status(200).send({
        ...exam,
        questions: processedQuestions
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

    const decodedExamFlags = FlagDecoder.exam(exam.flags);
    if (!decodedExamFlags.published) {
        throw new NotFoundError("Exam not found");
    }


    const processedQuestions = await Promise.all(exam.questions.map(async (question) => {
        const decodedQuestionFlags = FlagDecoder.question(question.flags);

        if (!decodedQuestionFlags.published) {
            return null;
        }
        const stats = await questionStats(new Date(), Epoch);
        return {
            ...question,
            topics: question.topics.map(relation => relation.topic),
            questionStats: stats
        };
    }));


    const filteredQuestions = processedQuestions.filter(question => question !== null);
    res.status(200).send({
        ...exam,
        questions: filteredQuestions
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