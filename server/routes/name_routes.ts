const { PrismaClient, Season } = require('@prisma/client')
const express = require('express');

const prisma = new PrismaClient();
const app = express();

const cache = require('./caching');
const _ = require('lodash')

const courseRegex = (courseAbbrev) => {
    const regex = /([a-zA-Z]+)(\d+)/;
    const matches = courseAbbrev.match(regex);
    if (matches) {
        return { abbreviation: matches[1], number: matches[2] }
    }
    return {}
}

// All courses metadata, no relations
app.get("/courses", cache(300), async (req, res) => {
    prisma.course.findMany({
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
        .then((courses) => {
            courses = _.groupBy(courses, 'subject')
            let result: { subject: string, courses: Array<string> }[] = [];
            _.forEach(courses, function (value, key) {
                result.push({ subject: key, courses: value })
            });
            result = _.orderBy(result, 'courses', 'desc')
            res.status(200).send(result)
        })
        .catch((err) => res.status(400).send(err.message))
});

// All topics metadata, no relations
app.get("/topics", cache(300), async (req, res) => {
    prisma.topic.findMany()
        .then(topics => res.status(200).send(topics))
        .catch((err) => res.status(400).send(err.message))
});

// All courses with relations
app.get("/courses/all", async (req, res) => {
    try {
        prisma.course.findMany({
            include: {
                topics: true,
                semesters: true,
                exams: {
                    include: {
                        questions: {
                            include: {
                                topics: true
                            }
                        },
                        semester: true,
                    }
                }
            }
        })
            .then((courses) => {
                if (courses) {
                    res.status(200).send(courses);
                } else {
                    res.status(404).send("Courses not found");
                }
            })
            .catch((err) => res.status(400).send(err));
    } catch (e) {
        res.status(400).send(e)
    }
});

// Metadata for specific course, no relations
app.get("/courses/:courseAbbrev", cache(300), async (req, res) => {
    try {
        const { courseAbbrev } = req.params
        const { abbreviation, number } = courseRegex(courseAbbrev);
        if (!abbreviation || !number) {
            res.status(400).send("Invalid parameters")
            return
        }
        prisma.course.findUnique({
            where: {
                abbreviation_number_published: {
                    abbreviation: abbreviation.toUpperCase(),
                    number: Number(number),
                    published: true
                },
            }
        })
            .then((course) => {
                if (course) {
                    res.status(200).send(course)
                } else {
                    res.status(404).send("Course not found")
                }
            })
            .catch((err) => res.status(400).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
})

// All topics for a specific course, no other relations
app.get("/courses/:courseAbbrev/topics", cache(300), async (req, res) => {
    try {
        const { courseAbbrev } = req.params;

        const { abbreviation, number } = courseRegex(courseAbbrev);
        if (!abbreviation || !number) {
            return res.status(400).send("Invalid parameters")
        }

        prisma.course.findUnique({
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
        }).then((course) => {
            if (course) {
                return res.status(200).send(course.topics)
            }
            else {
                return res.status(404).send("Topics not found")
            }
        }).catch((err) => res.status(400).send(err.message))
    } catch (e) {
        res.status(400).send(e)
    }
});

// All questions with topics included for a specific topic in a course.
// Includes questions from other courses.
app.get("/courses/:courseAbbrev/topics/questions", cache(300), async (req, res) => {
    try {
        const { courseAbbrev } = req.params;

        const { abbreviation, number } = courseRegex(courseAbbrev);
        if (!abbreviation || !number) {
            return res.status(400).send("Invalid parameters")
        }

        prisma.course.findUnique({
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
            .then((course) => {
                if (course && course.topics) {
                    res.status(200).send(course.topics);
                } else {
                    res.status(404).send("Topics and questions not found");
                }
            })
            .catch((err) => res.status(400).send(err.message));
    } catch (e) {
        res.status(400).send(e)
    }
});

// All exams with semester (no questions)
app.get("/courses/:courseAbbrev/exams", cache(300), async (req, res) => {
    try {
        const { courseAbbrev } = req.params;
        //courseAbbrev is the course abbreviation and code (ex: MA166)
        const { abbreviation, number } = courseRegex(courseAbbrev);
        if (!abbreviation || !number) {
            return res.status(400).send("Invalid parameters")
        }

        prisma.course.findUnique({
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
        }).then((course) => {
            if (course) {
                return res.status(200).send(course.exams)
            }
            else {
                return res.status(404).send("Exams and questions not found")
            }
        }).catch((err) => res.status(400).send(err.message))
    } catch (e) {
        res.status(400).send(e)
    }
})

// All exams with question ids and numbers
app.get("/courses/:courseAbbrev/exams/questions", cache(300), async (req, res) => {
    try {
        const { courseAbbrev } = req.params;
        //courseAbbrev is the course abbreviation and code (ex: MA166)
        const { abbreviation, number } = courseRegex(courseAbbrev);
        if (!abbreviation || !number) {
            return res.status(400).send("Invalid parameters")
        }

        prisma.course.findUnique({
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
        }).then((course) => {
            if (course) {
                return res.status(200).send(course.exams)
            }
            else {
                return res.status(404).send("Exams not found")
            }
        }).catch((err) => res.status(400).send(err.message))
    } catch (e) {
        res.status(400).send(e)
    }
})

// Full question information for specific topic
app.get("/courses/:courseAbbrev/topics/:topicName/questions", async (req, res) => {
    const { topicName } = req.params;
    prisma.topic.findUnique({
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
                    exam: {
                        select: {
                            number: true,
                            semester: true,
                        }
                    }
                }
            }
        }
    })
        .then((topics) => {
            if (topics) {
                res.status(200).send(topics);
            } else {
                res.status(404).send("Topics not found");
            }
        })
        .catch((err) => res.status(400).send(err));
});

// All questions with id, number, and topics for an exam
app.get("/courses/:courseAbbrev/exams/:season-:year-:examNumber", cache(300), async (req, res) => {
    try {
        const { courseAbbrev, season, year, examNumber } = req.params;
        const { abbreviation, number } = courseRegex(courseAbbrev);
        const season_type = Season[season.toUpperCase() as keyof typeof Season]
        if (!season_type) {
            return res.status(400).send("Invalid season");
        }
        if (!abbreviation || !number) {
            return res.status(400).send("Invalid parameters")
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
app.get("/courses/:courseAbbrev/exams/:season-:year-:examNumber/questions", cache(300), async (req, res) => {
    try {
        const { courseAbbrev, season, year, examNumber } = req.params
        const { abbreviation, number } = courseRegex(courseAbbrev);
        const season_type = Season[season.toUpperCase() as keyof typeof Season]
        if (!season_type) {
            return res.status(400).send("Invalid season");
        }
        if (!abbreviation || !number) {
            return res.status(400).send("Invalid parameters")
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
            return res.status(400).send("Invalid semester")
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
            return res.status(404).send("Course not found")
        }

        prisma.exam.findUnique({
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
                        topics: true
                    }
                }
            }
        })
            .then((exam) => {
                if (exam) {
                    res.status(200).send(exam)
                }
                else {
                    res.status(404).send("Exam not found")
                }
            })
            .catch((err) => res.status(400).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
});

app.get("/stats", cache(300), async(req, res) => {
    try {
        const questionsTotal = await prisma.question.count()

        const questions = await prisma.question.findMany({})
        let questionsAnswered = 0
        await questions.forEach((question) => {
            questionsAnswered += question.submissions.reduce((a,b) => a+b, 0)
        })
        res.status(200).send({questionsTotal, questionsAnswered})
    } catch(e) {
        res.status(400).send(e)
    }


})

module.exports = app
