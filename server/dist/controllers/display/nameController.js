var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import prisma from "../../libs/prisma.js";
import { InvalidSeasonError, NotFoundError } from "../../middleware/errors/index.js";
import { Season } from '@prisma/client';
import _ from 'lodash';
import validCourseRegex from '../../utils/validCourseRegex.js';
import answerChoiceStats from "../../helpers/stats/answerChoiceStats.js";
const questionSort = [
    {
        exam: {
            semester: {
                year: 'desc',
            },
        }
    },
    {
        exam: {
            semester: {
                season: 'asc'
            },
        }
    },
    {
        exam: {
            number: 'asc',
        }
    },
    {
        number: 'asc'
    }
];
// All courses metadata, with no relations
const getCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let courses = yield prisma.course.findMany({
        where: {
            OR: req.published
        },
        orderBy: [
            {
                subject: 'asc'
            },
            {
                number: 'asc'
            }
        ]
    });
    if (!courses.length) {
        throw new NotFoundError("No courses found");
    }
    courses = _.groupBy(courses, 'subject');
    let result = [];
    _.forEach(courses, function (value, key) {
        result.push({ subject: key, courses: value });
    });
    result = _.orderBy(result, 'courses', 'desc');
    res.status(200).send(result);
});
// All topics metadata, no relations
const getAllTopics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const topics = yield prisma.topic.findMany();
    if (!topics.length) {
        throw new NotFoundError("No topics found");
    }
    res.status(200).send(topics);
});
// All courses with relations
const getAllCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const courses = yield prisma.course.findMany({
        where: {
            OR: req.published
        },
        include: {
            topics: true,
            semesters: true,
            exams: {
                where: {
                    OR: req.published
                },
                include: {
                    questions: {
                        where: {
                            OR: req.published
                        },
                        include: {
                            topics: true,
                            answerChoices: {
                                orderBy: {
                                    choiceIndex: 'asc'
                                },
                                include: {
                                    resources: {
                                        include: {
                                            image: true,
                                            code: true
                                        }
                                    }
                                }
                            },
                            resources: {
                                include: {
                                    image: true,
                                    code: true
                                }
                            }
                        }
                    },
                    semester: true,
                }
            },
            users: true
        }
    });
    if (!courses) {
        throw new NotFoundError("Courses not found");
    }
    res.status(200).send(courses);
});
// Metadata for specific course, no relations
const getCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseAbbrev } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);
    const course = yield prisma.course.findFirst({
        where: {
            abbreviation: abbreviation.toUpperCase(),
            number: Number(number),
            OR: req.published
        }
    });
    if (!course) {
        throw new NotFoundError("No course found");
    }
    res.status(200).send(course);
});
// All topics for a specific course, no other relations
const getCourseTopics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseAbbrev } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);
    const course = yield prisma.course.findFirst({
        where: {
            abbreviation: abbreviation.toUpperCase(),
            number: Number(number),
            OR: req.published
        },
        select: {
            topics: true
        },
        orderBy: {
            name: 'asc'
        }
    });
    if (!course) {
        throw new NotFoundError("Course not found");
    }
    res.status(200).send(course.topics);
});
// All questions with topics included for a specific topic in a course.
// Includes questions from other courses.
const getCourseTopicsWithBasicQuestionInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseAbbrev } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);
    const course = yield prisma.course.findFirst({
        where: {
            abbreviation: abbreviation.toUpperCase(),
            number: Number(number),
            OR: req.published
        },
        select: {
            topics: {
                include: {
                    questions: {
                        where: {
                            course: {
                                abbreviation: abbreviation.toUpperCase(),
                                number: Number(number)
                            },
                            OR: req.published
                        },
                        select: {
                            id: true,
                            number: true,
                            exam: {
                                include: {
                                    semester: true,
                                }
                            },
                            topics: {
                                orderBy: {
                                    name: 'asc'
                                }
                            },
                        },
                        orderBy: questionSort
                    }
                },
                orderBy: {
                    name: 'asc'
                }
            },
            questions: {
                where: {
                    course: {
                        abbreviation: abbreviation.toUpperCase(),
                        number: Number(number)
                    },
                    topics: {
                        none: {}
                    }
                },
                select: {
                    id: true,
                    number: true,
                    exam: {
                        include: {
                            semester: true,
                        }
                    }
                },
                orderBy: questionSort,
            },
        },
    });
    if (!course) {
        throw new NotFoundError("Course not found");
    }
    res.status(200).send(course);
});
// All exams with semester (no questions)
const getCourseExams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseAbbrev } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);
    const course = yield prisma.course.findFirst({
        where: {
            abbreviation: abbreviation.toUpperCase(),
            number: Number(number),
            OR: req.published
        },
        select: {
            exams: {
                where: {
                    OR: req.published
                },
                include: {
                    semester: true
                }
            }
        }
    });
    if (!course) {
        throw new NotFoundError("Course not found");
    }
    const exams = course.exams;
    const sortedExams = _.orderBy(exams, ["semester.year", "semester.season", (exam) => exam.number === 0 ? 10 : exam.number], ['desc', 'asc', 'asc']);
    res.status(200).send(sortedExams);
});
// All exams with question ids and numbers
const getCourseExamsWithBasicQuestionInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseAbbrev } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);
    const course = yield prisma.course.findFirst({
        where: {
            abbreviation: abbreviation.toUpperCase(),
            number: Number(number),
            OR: req.published
        },
        select: {
            exams: {
                where: {
                    OR: req.published
                },
                include: {
                    questions: {
                        where: {
                            OR: req.published
                        },
                        orderBy: {
                            number: 'asc'
                        },
                        select: {
                            id: true,
                            number: true
                        },
                    },
                    semester: true
                }
            },
        },
    });
    if (!course) {
        throw new NotFoundError("Course not found");
    }
    const exams = course.exams;
    const sortedExams = _.orderBy(exams, ["semester.year", "semester.season", (exam) => exam.number === 0 ? 10 : exam.number], ['desc', 'asc', 'asc']);
    res.status(200).send(sortedExams);
});
// Full question information for specific topic
const getCourseTopicWithFullQuestionInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseAbbrev, topicName } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);
    const topic = yield prisma.topic.findUnique({
        where: {
            name: topicName
        },
        include: {
            questions: {
                where: {
                    course: {
                        abbreviation: abbreviation.toUpperCase(),
                        number: Number(number),
                        OR: req.published
                    },
                    OR: req.published
                },
                include: {
                    topics: true,
                    answerChoices: {
                        orderBy: {
                            choiceIndex: 'asc'
                        },
                        include: {
                            resources: {
                                include: {
                                    image: true,
                                    code: true
                                }
                            }
                        }
                    },
                    resources: {
                        include: {
                            image: true,
                            code: true
                        }
                    }
                },
                orderBy: questionSort
            }
        }
    });
    if (!topic) {
        throw new NotFoundError("Topic not found");
    }
    const promises = [];
    for (const question of topic.questions) {
        promises.push(answerChoiceStats(question.id));
    }
    const resolved = yield Promise.all(promises);
    for (let i = 0; i < resolved.length; i++) {
        // @ts-ignore
        // Extend later
        topic.questions[i].answerChoiceStats = resolved[i];
    }
    res.status(200).send(topic);
});
// All questions with id, number, and topics for an exam
const getCourseExamWithBasicQuestionInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseAbbrev, season, year, examNumber } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);
    const season_type = Season[season.toUpperCase()];
    if (!season_type) {
        throw new InvalidSeasonError("Invalid season");
    }
    const course = yield prisma.course.findFirst({
        where: {
            abbreviation: abbreviation.toUpperCase(),
            number: Number(number),
            OR: req.published
        },
        include: {
            semesters: {
                where: {
                    season: season_type,
                    year: Number(year)
                },
            }
        }
    });
    if (!course) {
        throw new NotFoundError("Course not found");
    }
    if (!course.semesters.length) {
        throw new NotFoundError("Semester not found");
    }
    const exam = yield prisma.exam.findFirst({
        where: {
            number: Number(examNumber),
            courseId: course.id,
            semesterId: course.semesters[0].id,
            OR: req.published
        },
        include: {
            questions: {
                where: {
                    OR: req.published
                },
                orderBy: {
                    number: 'asc'
                },
                select: {
                    id: true,
                    number: true,
                    topics: true
                }
            }
        }
    });
    if (!exam) {
        throw new NotFoundError("Exam not found");
    }
    res.status(200).send(exam);
});
// All questions for a specific exam, includes topics within questions.
const getCourseExamWithFullQuestionInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseAbbrev, season, year, examNumber } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);
    const season_type = Season[season.toUpperCase()];
    if (!season_type) {
        throw new InvalidSeasonError("Invalid season");
    }
    const semester = yield prisma.semester.findUnique({
        where: {
            season_year: {
                season: season_type,
                year: Number(year)
            }
        }
    });
    if (!semester) {
        throw new NotFoundError("Semester not found");
    }
    const course = yield prisma.course.findFirst({
        where: {
            abbreviation: abbreviation.toUpperCase(),
            number: Number(number),
            OR: req.published
        }
    });
    if (!course) {
        throw new NotFoundError("Course not found");
    }
    const exam = yield prisma.exam.findFirst({
        where: {
            number: Number(examNumber),
            courseId: course.id,
            semesterId: semester.id,
            OR: req.published
        },
        include: {
            questions: {
                where: {
                    OR: req.published
                },
                orderBy: {
                    number: 'asc'
                },
                include: {
                    topics: true,
                    answerChoices: {
                        orderBy: {
                            choiceIndex: 'asc'
                        },
                        include: {
                            resources: {
                                include: {
                                    image: true,
                                    code: true
                                }
                            }
                        }
                    },
                    resources: {
                        include: {
                            image: true,
                            code: true
                        }
                    }
                }
            }
        }
    });
    if (!exam) {
        throw new NotFoundError("Exam not found");
    }
    const promises = [];
    for (const question of exam.questions) {
        promises.push(answerChoiceStats(question.id));
    }
    const resolved = yield Promise.all(promises);
    for (let i = 0; i < resolved.length; i++) {
        // @ts-ignore
        // Extend later
        exam.questions[i].answerChoiceStats = resolved[i];
    }
    res.status(200).send(exam);
});
export { getCourses, getAllTopics, getAllCourses, getCourse, getCourseTopics, getCourseTopicsWithBasicQuestionInfo, getCourseExams, getCourseExamsWithBasicQuestionInfo, getCourseTopicWithFullQuestionInfo, getCourseExamWithBasicQuestionInfo, getCourseExamWithFullQuestionInfo };
//# sourceMappingURL=nameController.js.map