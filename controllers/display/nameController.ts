import prisma from "../../libs/prisma.js";
import { InvalidSeasonError, NotFoundError } from "../../middleware/errors/index.js";
import { Season } from "@prisma/client";
import { Request, Response } from "express";
import _ from "lodash";
import validCourseRegex from "../../utils/validCourseRegex.js";
import answerChoiceStats from "../../helpers/stats/multiple.answerChoiceStats.js";
import questionStats from "../../helpers/stats/questionStats.js";

const questionSort: QuestionSortCategory[] = [
    {
        exam: {
            semester: {
                year: "desc",
            },
        },
    },
    {
        exam: {
            semester: {
                season: "asc",
            },
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

// All courses metadata, with no relations
const getCourses = async (req: Request, res: Response) => {
    let courses = await prisma.course.findMany({
        where: {
            OR: req.published,
        },
        orderBy: [
            {
                subject: "asc",
            },
            {
                number: "asc",
            },
        ],
    });

    if (!courses.length) {
        throw new NotFoundError("No courses found");
    }
    courses = _.groupBy(courses, "subject");
    let result: { subject: string; courses: Array<string> }[] = [];
    _.forEach(courses, (value, key) => {
        result.push({ subject: key, courses: value });
    });
    result = _.orderBy(result, "courses", "desc");
    res.status(200).send(result);
};

// All topics metadata, no relations
const getAllTopics = async (req: Request, res: Response) => {
    const topics = await prisma.topic.findMany();
    if (!topics.length) {
        throw new NotFoundError("No topics found");
    }
    res.status(200).send(topics);
};

// All courses with relations
const getAllCourses = async (req: Request, res: Response) => {
    const courses = await prisma.course.findMany({
        where: {
            OR: req.published,
        },
        include: {
            topics: true,
            semesters: true,
            exams: {
                where: {
                    OR: req.published,
                },
                include: {
                    questions: {
                        where: {
                            OR: req.published,
                        },
                        include: {
                            topics: true,
                            answerChoices: {
                                orderBy: {
                                    choiceIndex: "asc",
                                },
                                include: {
                                    resources: {
                                        include: {
                                            image: true,
                                            code: true,
                                        },
                                    },
                                },
                            },
                            resources: {
                                include: {
                                    image: true,
                                    code: true,
                                },
                            },
                        },
                    },
                    semester: true,
                },
            },
            users: true,
        },
    });
    if (!courses) {
        throw new NotFoundError("Courses not found");
    }
    res.status(200).send(courses);
};

// Metadata for specific course, no relations
const getCourse = async (req: Request, res: Response) => {
    const { courseAbbrev } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);

    const course = await prisma.course.findFirst({
        where: {
            abbreviation: abbreviation.toUpperCase(),
            number: Number(number),
            OR: req.published,
        },
        include: {
            events: {
                orderBy: {
                    start: "asc",
                },
            },
        },
    });
    if (!course) {
        throw new NotFoundError("No course found");
    }
    res.status(200).send(course);
};

// All topics for a specific course, no other relations
const getCourseTopics = async (req: Request, res: Response) => {
    const { courseAbbrev } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);

    const course = await prisma.course.findFirst({
        where: {
            abbreviation: abbreviation.toUpperCase(),
            number: Number(number),
            OR: req.published,
        },
        select: {
            topics: true,
        },
        orderBy: {
            name: "asc",
        },
    });

    if (!course) {
        throw new NotFoundError("Course not found");
    }
    res.status(200).send(course.topics);
};

// All questions with topics included for a specific topic in a course.
// Includes questions from other courses.
const getCourseTopicsWithBasicQuestionInfo = async (req: Request, res: Response) => {
    const { courseAbbrev } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);

    const course = await prisma.course.findFirst({
        where: {
            abbreviation: abbreviation.toUpperCase(),
            number: Number(number),
            OR: req.published,
        },
        select: {
            topics: {
                include: {
                    questions: {
                        where: {
                            course: {
                                abbreviation: abbreviation.toUpperCase(),
                                number: Number(number),
                            },
                            OR: req.published,
                        },
                        select: {
                            id: true,
                            number: true,
                            published: true,
                        },
                        orderBy: questionSort,
                    },
                },
                orderBy: {
                    name: "asc",
                },
            },
            questions: {
                where: {
                    course: {
                        abbreviation: abbreviation.toUpperCase(),
                        number: Number(number),
                    },
                    OR: req.published,
                    topics: {
                        none: {},
                    },
                },
                select: {
                    id: true,
                    number: true,
                    published: true,
                },
                orderBy: questionSort,
            },
        },
    });
    if (!course) {
        throw new NotFoundError("Course not found");
    }

    res.status(200).send(course);
};

// All exams with semester (no questions)
const getCourseExams = async (req: Request, res: Response) => {
    const { courseAbbrev } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);

    const course = await prisma.course.findFirst({
        where: {
            abbreviation: abbreviation.toUpperCase(),
            number: Number(number),
            OR: req.published,
        },
        select: {
            exams: {
                where: {
                    OR: req.published,
                },
                include: {
                    semester: true,
                },
            },
        },
    });

    if (!course) {
        throw new NotFoundError("Course not found");
    }
    const exams = course.exams;
    const sortedExams = _.orderBy(
        exams,
        [(exam) => (exam.number === 0 ? 10 : exam.number), "semester.year", "semester.season"],
        ["asc", "desc", "asc"],
    );
    res.status(200).send(sortedExams);
};

// All exams with question ids and numbers
const getCourseExamsWithBasicQuestionInfo = async (req: Request, res: Response) => {
    const { courseAbbrev } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);

    const course = await prisma.course.findFirst({
        where: {
            abbreviation: abbreviation.toUpperCase(),
            number: Number(number),
            OR: req.published,
        },
        select: {
            exams: {
                where: {
                    OR: req.published,
                },
                include: {
                    questions: {
                        where: {
                            OR: req.published,
                        },
                        select: {
                            id: true,
                            number: true,
                            published: true,
                        },
                        orderBy: {
                            number: "asc",
                        },
                    },
                    semester: true,
                },
            },
        },
    });
    if (!course) {
        throw new NotFoundError("Course not found");
    }

    const exams = course.exams;
    const sortedExams = _.orderBy(
        exams,
        [(exam) => (exam.number === 0 ? 10 : exam.number), "semester.year", "semester.season"],
        ["asc", "desc", "asc"],
    );
    res.status(200).send(sortedExams);
};

// Basic question information for specific topic
const getCourseTopicWithBasicQuestionInfo = async (req: Request, res: Response) => {
    const { courseAbbrev, topicName } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);

    const topic = await prisma.topic.findUnique({
        where: {
            name: topicName,
        },
        include: {
            questions: {
                where: {
                    course: {
                        abbreviation: abbreviation.toUpperCase(),
                        number: Number(number),
                        OR: req.published,
                    },
                    OR: req.published,
                },
                select: {
                    id: true,
                    number: true,
                    correctChoiceIndices: true,
                    topics: true,
                    published: true,
                },
                orderBy: questionSort,
            },
        },
    });
    if (!topic) {
        throw new NotFoundError("Topic not found");
    }

    const answerStats = await answerChoiceStats(topic.questions.map((question) => question.id));
    for (let i = 0; i < answerStats.length; i++) {
        // @ts-expect-error Extend later
        topic.questions[i].answerChoiceStats = answerStats[i];
        // @ts-expect-error Extend later
        topic.questions[i].percentCorrect =
            (answerStats[i][topic.questions[i].correctChoiceIndices[0]] * 100) /
            answerStats[i].reduce((sum: number, a: number) => sum + a, 0);
        // @ts-expect-error Extend later
        delete topic.questions[i].correctChoiceIndices;
    }

    topic.questions = await Promise.all(topic.questions.map(async (q) => {
        const stats = await questionStats(q.id);
        // @ts-expect-error Plz work
        q.difficulty = stats.totalCorrectSubmissions / stats.totalSubmissions;
       return q;
    }));

    res.status(200).send(topic);
};

// Full question information for specific topic
const getCourseTopicWithFullQuestionInfo = async (req: Request, res: Response) => {
    const { courseAbbrev, topicName } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);

    const topic = await prisma.topic.findUnique({
        where: {
            name: topicName,
        },
        include: {
            questions: {
                where: {
                    course: {
                        abbreviation: abbreviation.toUpperCase(),
                        number: Number(number),
                        OR: req.published,
                    },
                    OR: req.published,
                },
                include: {
                    topics: true,
                    exam: {
                        include: {
                            semester: true,
                        },
                    },
                    answerChoices: {
                        orderBy: {
                            choiceIndex: "asc",
                        },
                        include: {
                            resources: {
                                include: {
                                    image: true,
                                    code: true,
                                },
                            },
                        },
                    },
                    resources: {
                        include: {
                            image: true,
                            code: true,
                        },
                    },
                },
                orderBy: questionSort,
            },
        },
    });
    if (!topic) {
        throw new NotFoundError("Topic not found");
    }

    /* OLD METHOD USING PRISMA ONLY
    const promises: Promise<number[]>[] = [];

    for (const question of topic.questions) {
        promises.push(answerChoiceStats(question.id));
    }

    const resolved = await Promise.all(promises);
    */

    const answerStats = await answerChoiceStats(topic.questions.map((question) => question.id));
    for (let i = 0; i < answerStats.length; i++) {
        // @ts-expect-error Extend Later
        topic.questions[i].answerChoiceStats = answerStats[i];
    }
    
    topic.questions = await Promise.all(topic.questions.map(async (q) => {
        const stats = await questionStats(q.id);
        // @ts-expect-error Plz work
        q.difficulty = stats.totalCorrectSubmissions / stats.totalSubmissions;
       return q;
    }));

    res.status(200).send(topic);
};

// All questions with id, number, and topics for an exam
const getCourseExamWithBasicQuestionInfo = async (req: Request, res: Response) => {
    const { courseAbbrev, season, year, examNumber } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);
    const season_type = Season[season.toUpperCase() as keyof typeof Season];

    if (!season_type) {
        throw new InvalidSeasonError("Invalid season");
    }

    const course = await prisma.course.findFirst({
        where: {
            abbreviation: abbreviation.toUpperCase(),
            number: Number(number),
            OR: req.published,
        },
        include: {
            semesters: {
                where: {
                    season: season_type,
                    year: Number(year),
                },
            },
        },
    });

    if (!course) {
        throw new NotFoundError("Course not found");
    }
    if (!course.semesters.length) {
        throw new NotFoundError("Semester not found");
    }

    const exam = await prisma.exam.findFirst({
        where: {
            number: Number(examNumber),
            courseId: course.id,
            semesterId: course.semesters[0].id,
            OR: req.published,
        },
        include: {
            questions: {
                where: {
                    OR: req.published,
                },
                select: {
                    id: true,
                    number: true,
                    topics: true,
                    published: true,
                },
                orderBy: {
                    number: "asc",
                },
            },
        },
    });

    if (!exam) {
        throw new NotFoundError("Exam not found");
    }

    exam.questions = await Promise.all(exam.questions.map(async (q) => {
        const stats = await questionStats(q.id);
        // @ts-expect-error Plz work
        q.difficulty = stats.totalCorrectSubmissions / stats.totalSubmissions;
        return q;
    }));

    res.status(200).send(exam);
};

// All questions for a specific exam, includes topics within questions.
const getCourseExamWithFullQuestionInfo = async (req: Request, res: Response) => {
    const { courseAbbrev, season, year, examNumber } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);
    const season_type = Season[season.toUpperCase() as keyof typeof Season];

    if (!season_type) {
        throw new InvalidSeasonError("Invalid season");
    }

    const semester = await prisma.semester.findUnique({
        where: {
            season_year: {
                season: season_type,
                year: Number(year),
            },
        },
    });
    if (!semester) {
        throw new NotFoundError("Semester not found");
    }

    const course = await prisma.course.findFirst({
        where: {
            abbreviation: abbreviation.toUpperCase(),
            number: Number(number),
            OR: req.published,
        },
    });
    if (!course) {
        throw new NotFoundError("Course not found");
    }

    const exam = await prisma.exam.findFirst({
        where: {
            number: Number(examNumber),
            courseId: course.id,
            semesterId: semester.id,
            OR: req.published,
        },
        include: {
            questions: {
                where: {
                    OR: req.published,
                },
                orderBy: {
                    number: "asc",
                },
                include: {
                    topics: true,
                    answerChoices: {
                        orderBy: {
                            choiceIndex: "asc",
                        },
                        include: {
                            resources: {
                                include: {
                                    image: true,
                                    code: true,
                                },
                            },
                        },
                    },
                    resources: {
                        include: {
                            image: true,
                            code: true,
                        },
                    },
                },
            },
        },
    });
    if (!exam) {
        throw new NotFoundError("Exam not found");
    }

    /* OLD METHOD USING PRISMA ONLY
    const promises: Promise<number[]>[] = [];

    for (const question of exam.questions) {
        promises.push(answerChoiceStats(question.id));
        //promises.push(newStats(question.id, question.answerChoices.map((choice) => choice.choiceIndex)));
    }

    const resolved = await Promise.all(promises);
    */
    const answerStats = await answerChoiceStats(exam.questions.map((question) => question.id));
    for (let i = 0; i < answerStats.length; i++) {
        // @ts-expect-error Extend Later
        exam.questions[i].answerChoiceStats = answerStats[i];
    }

    exam.questions = await Promise.all(exam.questions.map(async (q) => {
        const stats = await questionStats(q.id);
        // @ts-expect-error Plz work
        q.difficulty = stats.totalCorrectSubmissions / stats.totalSubmissions;
        return q;
    }));

    res.status(200).send(exam);
};

export {
    getCourses,
    getAllTopics,
    getAllCourses,
    getCourse,
    getCourseTopics,
    getCourseTopicsWithBasicQuestionInfo,
    getCourseExams,
    getCourseExamsWithBasicQuestionInfo,
    getCourseTopicWithBasicQuestionInfo,
    getCourseTopicWithFullQuestionInfo,
    getCourseExamWithBasicQuestionInfo,
    getCourseExamWithFullQuestionInfo,
};
