const { PrismaClient, Season } = require('@prisma/client')
const express = require('express');

const prisma = new PrismaClient();
const app = express();

const cache = require('./caching');

const courseRegex = (courseAbbrev) => {
    const regex = /([a-zA-Z]+)(\d+)/;
    const matches = courseAbbrev.match(regex);
    if (matches) {
        return { subject: matches[1], number: matches[2] }
    }
    return {}
}

// All courses metadata, no relations
app.get("/courses", cache(300), async (req, res) => {
    prisma.course.findMany()
        .then((courses) => res.status(200).send(courses))
        .catch((err) => res.status(400).send(err.message))
});

// All courses with relations
app.get("/courses/all", cache(300), async (req, res) => {
    try {
        prisma.course.findMany({
            include: {
                topics: {
                    include: {
                        questions: true
                    }
                },
                semesters: true,
                exams: {
                    include: {
                        questions: true,
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
        const { subject, number } = courseRegex(courseAbbrev);
        if (!subject || !number) {
            res.status(400).send("Invalid parameters")
            return
        }
        prisma.course.findUnique({
            where: {
                subject_number: {
                    subject: subject.toUpperCase(),
                    number: Number(number)
                }
            }
        })
            .then((resp) => {
                if (resp) {
                    res.status(200).send(resp)
                } else {
                    res.status(404).send("Course not found")
                }
            })
            .catch((err) => res.status(400).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
})

// All topics metadata, no relations
app.get("/topics", cache(300), async (req, res) => {
    prisma.topic.findMany()
        .then(topics => res.status(200).send(topics))
        .catch((err) => res.status(400).send(err.message))
});

// All topics for a specific course, no other relations
app.get("/courses/:courseAbbrev/topics", cache(300), async (req, res) => {
    try {
        const { courseAbbrev } = req.params;

        const { subject, number } = courseRegex(courseAbbrev);
        if (!subject || !number) {
            return res.status(400).send("Invalid parameters")
        }

        prisma.course.findUnique({
            where: {
                subject_number: {
                    subject: subject.toUpperCase(),
                    number: Number(number)
                },
            },
            select: {
                topics: true
            }
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

        const { subject, number } = courseRegex(courseAbbrev);
        if (!subject || !number) {
            return res.status(400).send("Invalid parameters")
        }

        prisma.course.findUnique({
            where: {
                subject_number: {
                    subject: subject.toUpperCase(),
                    number: Number(number),
                },
            },
            include: {
                topics: {
                    include: {
                        questions: {
                            include: {
                                exam: true,
                                topics: true
                            }
                        }
                    },
                },
            },
        })
            .then((course) => {
                if (course) {
                    res.status(200).send(course.topics);
                } else {
                    res.status(404).send("Questions and Topics not found");
                }
            })
            .catch((err) => res.status(400).send(err.message));
    } catch (e) {
        res.status(400).send(e)
    }
});

// All exams metadata for a specific course
app.get("/courses/:courseAbbrev/exams", cache(300), async (req, res) => {
    try {
        const { courseAbbrev } = req.params;
        //courseAbbrev is the course abbreviation and code (ex: MA166)
        const { subject, number } = courseRegex(courseAbbrev);
        if (!subject || !number) {
            return res.status(400).send("Invalid parameters")
        }

        prisma.course.findUnique({
            where: {
                subject_number: {
                    subject: subject.toUpperCase(),
                    number: Number(number)
                },
            },
            select: {
                exams: true
            }
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

// All exams with questions inlcuding topics for a specific course
app.get("/courses/:courseAbbrev/exams/questions", cache(300), async (req, res) => {
    try {
        const { courseAbbrev } = req.params;
        //courseAbbrev is the course abbreviation and code (ex: MA166)
        const { subject, number } = courseRegex(courseAbbrev);
        if (!subject || !number) {
            return res.status(400).send("Invalid parameters")
        }

        prisma.course.findUnique({
            where: {
                subject_number: {
                    subject: subject.toUpperCase(),
                    number: Number(number)
                },
            },
            select: {
                exams: {
                    include: {
                        questions: {
                            include: {
                                topics: true
                            }
                        }
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

// All questions with id, number, and topics for an exam
app.get("/courses/:courseAbbrev/exams/:season-:year-:examNumber", cache(300), async (req, res) => {
    try {
        const { courseAbbrev, season, year, examNumber } = req.params;
        const { subject, number } = courseRegex(courseAbbrev);
        let season_type = Season[season.toUpperCase() as keyof typeof Season]
        if (!season_type) {
            return res.status(400).send("Invalid season");
        }
        if (!subject || !number) {
            return res.status(400).send("Invalid parameters")
        }

        prisma.course.findUnique({
            where: {
                subject_number: {
                    subject: subject.toUpperCase(),
                    number: Number(number)
                },
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
                        number_courseId_semesterId: {
                            number: Number(examNumber),
                            courseId: course.id,
                            semesterId: course.semesters[0].id
                        },

                    },
                    include: {
                        questions: {
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
        const { subject, number } = courseRegex(courseAbbrev);
        let season_type = Season[season.toUpperCase() as keyof typeof Season]
        if (!season_type) {
            return res.status(400).send("Invalid season");
        }
        if (!subject || !number) {
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
        prisma.course.findUnique({
            where: {
                subject_number: {
                    subject: subject.toUpperCase(),
                    number: Number(number)
                }
            },
            select: {
                exams: {
                    where: {
                        number: Number(examNumber),
                        semesterId: semester.id
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
                }
            }
        })
            .then((resp) => {
                if (resp.exams.length) {
                    res.status(200).send(resp.exams[0])
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

module.exports = app