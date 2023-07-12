import { InvalidSeasonError, NotFoundError } from "../middleware/errors/index";

const { PrismaClient, Season } = require('@prisma/client')
const prisma = new PrismaClient();

const express = require('express');
const app = express();

const cache = require('../cache/caching');
const _ = require('lodash')
const asyncWrapper = require('../middleware/wrappers/asyncWrapper')

const validCourseRegex = require('../utils/validCourseRegex')

// All courses metadata, no relations
app.get("/courses", cache(300), asyncWrapper(async (req, res) => {
    let courses = await prisma.course.findMany({
        where: {
            published: true
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
app.get("/topics", cache(300), asyncWrapper(async (req, res) => {
    const topics = await prisma.topic.findMany()
    if (!topics.length) {
        throw new NotFoundError("No topics found")
    }
    res.status(200).send(topics)
}));

// All courses with relations
app.get("/courses/all", asyncWrapper(async (req, res) => {
    const courses = await prisma.course.findMany({
        include: {
            topics: true,
            semesters: true,
            exams: {
                include: {
                    questions: {
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
        throw new Error("Courses not found")
    }
    res.status(200).send(courses);
}));

// Metadata for specific course, no relations
app.get("/courses/:courseAbbrev", cache(300), asyncWrapper(async (req, res) => {
    const { courseAbbrev } = req.params
    const { abbreviation, number } = validCourseRegex(courseAbbrev);

    const course = await prisma.course.findUnique({
        where: {
            abbreviation_number_published: {
                abbreviation: abbreviation.toUpperCase(),
                number: Number(number),
                published: true
            }
        }
    })
    if (!course) {
        throw new NotFoundError("No course found")
    }
    res.status(200).send(course)
}));

// All topics for a specific course, no other relations
app.get("/courses/:courseAbbrev/topics", cache(300), asyncWrapper(async (req, res) => {
    const { courseAbbrev } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);

    const course = await prisma.course.findUnique({
        where: {
            abbreviation_number_published: {
                abbreviation: abbreviation.toUpperCase(),
                number: Number(number),
                published: true
            }
        },
        select: {
            topics: true
        },
    })

    if (!course) {
        throw new NotFoundError("Course not found")
    }
    res.status(200).send(course.topics)
}));

// All questions with topics included for a specific topic in a course.
// Includes questions from other courses.
app.get("/courses/:courseAbbrev/topics/questions", cache(300), asyncWrapper(async (req, res) => {
    const { courseAbbrev } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);

    const course = await prisma.course.findUnique({
        where: {
            abbreviation_number_published: {
                abbreviation: abbreviation.toUpperCase(),
                number: Number(number),
                published: true
            }
        },
        select: {
            topics: {
                include: {
                    questions: {
                        where: {
                            exam: {
                                published: true
                            }
                        },
                        select: {
                            id: true,
                            number: true
                        }
                    }
                },
            },
        },
    })

    if (!course) {
        throw new NotFoundError("Course not found")
    }
    res.status(200).send(course.topics);
}));

// All exams with semester (no questions)
app.get("/courses/:courseAbbrev/exams", cache(300), asyncWrapper(async (req, res) => {
    const { courseAbbrev } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);

    const course = await prisma.course.findUnique({
        where: {
            abbreviation_number_published: {
                abbreviation: abbreviation.toUpperCase(),
                number: Number(number),
                published: true
            }
        },
        select: {
            exams: {
                where: {
                    published: true
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
    res.status(200).send(course.topics);
}));

// All exams with question ids and numbers
app.get("/courses/:courseAbbrev/exams/questions", cache(300), asyncWrapper(async (req, res) => {
    const { courseAbbrev } = req.params;
    const { abbreviation, number } = validCourseRegex(courseAbbrev);

    const course = await prisma.course.findUnique({
        where: {
            abbreviation_number_published: {
                abbreviation: abbreviation.toUpperCase(),
                number: Number(number),
                published: true
            }
        },
        select: {
            exams: {
                where: {
                    published: true
                },
                include: {
                    questions: {
                        orderBy: {
                            number: 'asc'
                        },
                        select: {
                            id: true,
                            number: true
                        },
                    },
                    semester: true
                },
            },
        },
    })

    if (!course) {
        throw new NotFoundError("Course not found")
    }
    res.status(200).send(course.exams);
}))

// Full question information for specific topic
app.get("/courses/:courseAbbrev/topics/:topicName/questions", asyncWrapper(async (req, res) => {
    const { topicName } = req.params;
    const topic = await prisma.topic.findUnique({
        where: {
            name: topicName
        },
        include: {
            questions: {
                where: {
                    exam: {
                        published: true
                    }
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

    if (!topic) {
        throw new NotFoundError("Topic not found")
    }
    res.status(200).send(topic);
}));

// All questions with id, number, and topics for an exam
app.get("/courses/:courseAbbrev/exams/:season-:year-:examNumber", cache(300), async (req, res) => {
    try {
        const { courseAbbrev, season, year, examNumber } = req.params;
        const { abbreviation, number } = validCourseRegex(courseAbbrev);
        const season_type = Season[season.toUpperCase() as keyof typeof Season]

        if (!season_type) {
            throw new InvalidSeasonError("Invalid season");
        }

        prisma.course.findUnique({
            where: {
                abbreviation_number_published: {
                    abbreviation: abbreviation.toUpperCase(),
                    number: Number(number),
                    published: true
                }
            },
            include: {
                semesters: {
                    where: {
                        season: season_type,
                        year: Number(year)
                    },
                }
            }
        }).then((course) => {
            if (course) {
                prisma.exam.findUnique({
                    where: {
                        number_courseId_semesterId_published: {
                            number: Number(examNumber),
                            courseId: course.id,
                            semesterId: course.semesters[0].id,
                            published: true
                        }
                    },
                    include: {
                        questions: {
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
                }).then((exam) => {
                    if (exam) {
                        return res.status(200).send(exam)
                    }
                    else {
                        return res.status(404).send("No exam found")
                    }
                })

            } else {
                return res.status(404).send("Exams and questions not found")
            }
        }).catch((err) => res.status(400).send(err.message))
    } catch (e) {
        res.status(400).send(e)
    }

})

// All questions for a specific exam, includes topics within questions.
app.get("/courses/:courseAbbrev/exams/:season-:year-:examNumber/questions", cache(300), asyncWrapper(async (req, res) => {
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

    const course = await prisma.course.findUnique({
        where: {
            abbreviation_number_published: {
                abbreviation: abbreviation.toUpperCase(),
                number: Number(number),
                published: true
            }
        }
    })
    if (!course) {
        throw new NotFoundError("Course not found");
    }

    const exam = await prisma.exam.findUnique({
        where: {
            number_courseId_semesterId_published: {
                number: Number(examNumber),
                courseId: course.id,
                semesterId: semester.id,
                published: true
            }
        },
        include: {
            questions: {
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

const questionStats = async (questionId) => {
    const submissions = await prisma.submission.aggregate({
            where: {
                questionId: questionId
            },
            _sum: {
                timeSpent: true,
                timeSpentVideo: true,
            },
            _count: true,
        })
    const timeSpent = submissions._sum.timeSpent
    const timeSpentVideo = submissions._sum.timeSpentVideo
    const submissionTotal = submissions._count

    const submissionCorrect = await prisma.submission.count({
        where: {
            questionId: questionId,
            correct: true
        }
    })
    return {timeSpent, timeSpentVideo, submissionTotal, submissionCorrect}
}

const examStats = async(examId) => {
    const questions = await prisma.exam.findUnique({
            where: {
                id: examId
            },
            select: {
                questions: {
                    select: {
                        id: true
                    }
                }
            }
        })
        const ids = questions.questions.map(q => q.id)

        const obj = {timeSpent: 0, timeSpentVideo: 0, submissionTotal: 0, submissionCorrect: 0};
        const keys = Object.keys(obj)
        for (let x = 0; x < ids.length; x ++ ){   
            const tempStats = Object.values(await questionStats(ids[x]))
            for (let i = 0; i < tempStats.length; i++) {
                obj[keys[i]] += tempStats[i]
            }
        }
        return obj
}
app.get("/stats/questions/:questionId", cache(300), async (req, res) => {
    try {
        const { questionId } = req.params
        const ret = await questionStats(questionId)
        res.status(200).send(ret)
    } catch (e) {
        res.status(400).send(e)
    }
})
app.get("/stats/exams/:examId", async(req, res) => {
    try {
        const {examId} = req.params
        const obj = await examStats(examId)
        res.status(200).send(obj)

    } catch(e) {
        res.status(400).send(e)
    }

})

app.get("/stats/courses/:courseId", async(req, res) => {

    try {
        const {courseId} = req.params
        const exams = await prisma.course.findUnique({
            where: {
                id: courseId
            },
            select:{
                exams: {
                    select: {
                        id: true
                    }
                }
            }
        })
        const ids = exams.exams.map(q => q.id)

        const obj = {timeSpent: 0, timeSpentVideo: 0, submissionTotal: 0, submissionCorrect: 0};
        const keys = Object.keys(obj)
        for (let x = 0; x < ids.length; x ++ ){   
            const tempStats = Object.values(await examStats(ids[x]))
            for (let i = 0; i < tempStats.length; i++) {
                obj[keys[i]] += tempStats[i]
            }
        }
        res.status(200).send(obj)


    } catch (e) {
        res.status(400).send(e)
    }
})
app.get("/stats/submissions", cache(300), async (req, res) => {
    try {
        const validTime = 300
        const times = await prisma.submission.aggregate({
            _sum: {
                timeSpent: true
            },
            _avg: {
                timeSpent: true
            },
            _count: true,
            where: {
                timeSpent: {
                    gte: validTime
                }
            },
        })
        const timeSpent = times._sum.timeSpent
        const avgTime = times._avg.timeSpent
        const submissionTotal = times._count
        const totalCorrect = await prisma.submission.count({
            where: {
                correct: true,
                timeSpent: {
                    gte: validTime
                }
            }
        })

        const percentCorrect = 100.0 * (totalCorrect / submissionTotal)
        res.status(200).send({ submissionTotal, timeSpent, avgTime, percentCorrect })
    } catch (e) {
        res.status(400).send(e)
    }
})

app.get("/webhooks", async (req, res) => {
    try {
        prisma.webhook.findMany({})
            .then((response) => res.status(200).send(response))
            .catch((err) => res.status(404).send(err))
    } catch (err) {
        res.status(400).send(err)
    }
});

app.get("/webhooks/:webhookId", async (req, res) => {
    try {
        const { webhookId } = req.params;
        prisma.webhook.findUnique({
            where: {
                id: webhookId
            }
        })
            .then((response) => res.status(200).send(response))
            .catch((err) => res.status(404).send(err))
    } catch (err) {
        res.status(400).send(err)
    }
});

module.exports = app
