import { InvalidSeasonError, NotFoundError } from "../middleware/errors/index.js";

import { PrismaClient, Season } from '@prisma/client';
import { Request, Response } from "express";
const prisma = new PrismaClient();

import express from 'express'
const app = express();

// import cache from '../cache/caching';
import _ from 'lodash'
import asyncWrapper from '../middleware/wrappers/asyncWrapper.js'

import validCourseRegex from '../utils/validCourseRegex.js'

import sendPublished from "../middleware/auth/sendPublished.js"

const questionSort: any = [
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
]

// All courses metadata, with no relations
app.get("/courses", sendPublished, asyncWrapper(async (req: Request, res: Response) => {
    let courses = await prisma.course.findMany({
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
    })

    if (!courses.length) {
        throw new NotFoundError("No courses found")
    }
    courses = _.groupBy(courses, 'subject')
    let result: { subject: string, courses: Array<string> }[] = [];
    _.forEach(courses, function (value, key) {
        result.push({ subject: key, courses: value })
    });
    result = _.orderBy(result, 'courses', 'desc')
    res.status(200).send(result)
}));

// All topics metadata, no relations
app.get("/topics", sendPublished, asyncWrapper(async (req: Request, res: Response) => {
    const topics = await prisma.topic.findMany()
    if (!topics.length) {
        throw new NotFoundError("No topics found")
    }
    res.status(200).send(topics)
}));

// All courses with relations
app.get("/courses/all", sendPublished, asyncWrapper(async (req: Request, res: Response) => {
    const courses = await prisma.course.findMany({
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
    })
    if (!courses) {
        throw new NotFoundError("Courses not found")
    }
    res.status(200).send(courses);
}));

// Metadata for specific course, no relations
app.get("/courses/:courseAbbrev", sendPublished, asyncWrapper(async (req: Request, res: Response) => {
    const { courseAbbrev } = req.params
    const { abbreviation, number } = validCourseRegex(courseAbbrev);

    const course = await prisma.course.findFirst({
        where: {
            abbreviation: abbreviation.toUpperCase(),
            number: Number(number),
            OR: req.published
        }
    })
    if (!course) {
        throw new NotFoundError("No course found")
    }
    res.status(200).send(course)
}));

// All topics for a specific course, no other relations
app.get("/courses/:courseAbbrev/topics", sendPublished, asyncWrapper(async (req: Request, res: Response) => {
    const { courseAbbrev } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);

    const course = await prisma.course.findFirst({
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
    })

    if (!course) {
        throw new NotFoundError("Course not found")
    }
    res.status(200).send(course.topics)
}));

// All questions with topics included for a specific topic in a course.
// Includes questions from other courses.
app.get("/courses/:courseAbbrev/topics/questions", sendPublished, asyncWrapper(async (req: Request, res: Response) => {
    const { courseAbbrev } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);

    const course = await prisma.course.findFirst({
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
                                select: {
                                    id: true,
                                    number: true,
                                    semester: true
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
                orderBy: questionSort,
            },
            
        },
    })

    if (!course) {
        throw new NotFoundError("Course not found")
    }
    res.status(200).send(course);
}));

// All exams with semester (no questions)
app.get("/courses/:courseAbbrev/exams", sendPublished, asyncWrapper(async (req: Request, res: Response) => {
    const { courseAbbrev } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);

    const course = await prisma.course.findFirst({
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
    })

    if (!course) {
        throw new NotFoundError("Course not found")
    }
    const exams = course.exams
    const sortedExams = _.orderBy(exams, ["semester.year", "semester.season", (exam) => exam.number === 0 ? 10 : exam.number], ['desc', 'asc', 'asc']);
    res.status(200).send(sortedExams);
}));

// All exams with question ids and numbers
app.get("/courses/:courseAbbrev/exams/questions", sendPublished, asyncWrapper(async (req: Request, res: Response) => {
    const { courseAbbrev } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);

    const course = await prisma.course.findFirst({
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
    })

    if (!course) {
        throw new NotFoundError("Course not found")
    }
    const exams = course.exams
    const sortedExams = _.orderBy(exams, ["semester.year", "semester.season", (exam) => exam.number === 0 ? 10 : exam.number], ['desc', 'asc', 'asc']);
    res.status(200).send(sortedExams);
}))

// Full question information for specific topic
app.get("/courses/:courseAbbrev/topics/:topicName/questions", sendPublished, asyncWrapper(async (req: Request, res: Response) => {
    const { courseAbbrev, topicName } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);

    const topic = await prisma.topic.findUnique({
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
    })

    if (!topic) {
        throw new NotFoundError("Topic not found")
    }
    res.status(200).send(topic);
}));

// All questions with id, number, and topics for an exam
app.get("/courses/:courseAbbrev/exams/:season-:year-:examNumber", sendPublished, asyncWrapper(async (req: Request, res: Response) => {
    const { courseAbbrev, season, year, examNumber } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);
    const season_type = Season[season.toUpperCase() as keyof typeof Season]

    if (!season_type) {
        throw new InvalidSeasonError("Invalid season");
    }

    const course = await prisma.course.findFirst({
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
    })

    if (!course) {
        throw new NotFoundError("Course not found")
    }
    if (!course.semesters.length) {
        throw new NotFoundError("Semester not found")
    }

    const exam = await prisma.exam.findFirst({
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
    })

    if (!exam) {
        throw new NotFoundError("Exam not found")
    }
    res.status(200).send(exam)
}))

// All questions for a specific exam, includes topics within questions.
app.get("/courses/:courseAbbrev/exams/:season-:year-:examNumber/questions", sendPublished, asyncWrapper(async (req: Request, res: Response) => {
    const { courseAbbrev, season, year, examNumber } = req.params
    const { abbreviation, number } = validCourseRegex(courseAbbrev);
    const season_type = Season[season.toUpperCase() as keyof typeof Season]

    if (!season_type) {
        throw new InvalidSeasonError("Invalid season");
    }

    const semester = await prisma.semester.findUnique({
        where: {
            season_year: {
                season: season_type,
                year: Number(year)
            }
        }
    })
    if (!semester) {
        throw new NotFoundError("Semester not found");
    }

    const course = await prisma.course.findFirst({
        where: {
            abbreviation: abbreviation.toUpperCase(),
            number: Number(number),
            OR: req.published
        }
    })
    if (!course) {
        throw new NotFoundError("Course not found");
    }

    const exam = await prisma.exam.findFirst({
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
    })

    if (!exam) {
        throw new NotFoundError("Exam not found")
    }
    res.status(200).send(exam)
}));


export default app