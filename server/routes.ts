const { PrismaClient, Season } = require('@prisma/client')
const express_routes = require('express');

const prisma = new PrismaClient();
const app = express_routes();

const multer = require('multer');
const axios = require('axios');

const dotenv = require("dotenv");
dotenv.config();

app.get("/", (req, res) => {
    res.send("Working")
})

app.post("/course", async (req, res) => {
    const { name, subject, number } = req.body
    prisma.course.create({
        data: {
            name: name,
            subject: subject,
            number: number

        }
    })
        .then((resp) => res.status(200).send(resp))
        .catch((err) => res.status(400).send(err.message))
});

app.post("/exam", async (req, res) => {
    const { course, season, year, number } = req.body
    const semester = await prisma.semester.upsert({
        where: {
            season_year: {
                season: Season[season as keyof typeof Season],
                year: Number(year)
            }
        },
        update: {},
        create: {
            season: Season[season as keyof typeof Season],
            year: Number(year)
        }
    })

    prisma.course.update({
        where: {
            id: course
        },
        data: {
            exams: {
                create: {
                    number: Number(number),
                    semester: {
                        connect: {
                            id: semester.id
                        }
                    }
                }
            },
            semesters: {
                connect: {
                    id: semester.id
                }
            }
        }
    })
        .then(exam => res.status(200).send(exam))
        .catch((err) => res.status(400).send(err.message))
})

app.post("/topic", async (req, res) => {
    const { name } = req.body
    prisma.topic.create({
        data: {
            name: name
        }
    })
        .then(() => res.status(200).send("success"))
        .catch((err) => res.status(400).send(err.message));
});

app.get("/courses/all", async (req, res) => {
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
            questions: true
          }
        }
      }
    })
      .then((courses) => {
        if (courses) {
          res.status(200).send(courses);
        } else {
          res.status(404).send("Course not found");
        }
      })
      .catch((err) => res.status(400).send(err));
  });


app.get("/courses/:courseAbbrev/topics", async(req, res) => {
    const { courseAbbrev } = req.params;

    const courseRegex = (courseAbbrev) => {
        const regex = /([A-Z]+)(\d+)/;
        const matches = courseAbbrev.match(regex);
        if (matches) {
            return {courseSubject: matches[1], courseNum: parseInt(matches[2])}
        }
        return {}
    }

    const {courseSubject, courseNum} = courseRegex(courseAbbrev);
    if (!courseSubject || !courseNum) {
        res.status(400).send("Invalid parameters")
        return
    }

    prisma.course.findUnique({
        where: {
            subject_number: {
                subject: courseSubject,
                number: courseNum
            },
        }, 
        select: {
            topics: true
        }
    }).then((course) => {
        if (course) {
            res.status(200).send(course.topics)
        }
        else {
            res.status(404).send("Topics Not found")
        }
    }).catch((err) => res.status(400).send(err.message))
});


app.get("/courses/:courseAbbrev/topics/questions", async (req, res) => {
    const { courseAbbrev } = req.params;

    const courseRegex = (courseAbbrev) => {
        const regex = /([A-Z]+)(\d+)/;
        const matches = courseAbbrev.match(regex);
        if (matches) {
            return {courseSubject: matches[1], courseNum: parseInt(matches[2])}
        }
        return {}
    }

    const {courseSubject, courseNum} = courseRegex(courseAbbrev);
    if (!courseSubject || !courseNum) {
        res.status(400).send("Invalid parameters")
        return
    }

    prisma.course.findUnique({
        where: {
        subject_number: {
            subject: courseSubject,
            number: courseNum,
        },
        },
        select: {
        topics: {
            include: {
            questions: true,
            },
        },
        },
    })
        .then((course) => {
        if (course) {
            res.status(200).send(course.topics);
        } else {
            res.status(404).send("Questions and Topics Not found");
        }
        })
        .catch((err) => res.status(400).send(err.message));
});

app.post("/course-topics", async (req, res) => {
    const { course, topics } = req.body;
    prisma.course.update({
        where: {
            id: course
        },
        data: {
            topics: {
                connect: topics.map(topicId => ({ id: topicId }))
            }
        }
    })
        .then((response) => res.status(200).send(response))
        .catch((err) => res.status(400).send(err.message));
});

app.post("/question", async (req, res) => {
    const { course, exam, topics, number, body, answerChoices, correctAnswer, solution } = req.body
    prisma.exam.update({
        where: {
            id: exam
        },
        data: {
            questions: {
                create: {
                    course: {
                        connect: {
                            id: course
                        }
                    }, 
                    topics: {
                        connect: topics.map(topicId => ({ id: topicId }))
                    },
                    number: Number(number),
                    body: body,
                    answerChoices: answerChoices,
                    correctChoiceIndex: Number(correctAnswer),
                    solutionVideoLink: solution
                }
            }
        }
    })
        .then((response) => res.status(200).send(response))
        .catch((err) => res.status(400).send(err.message));
});

app.get("/courses", async (req, res) => {
    prisma.course.findMany()
        .then((courses) => res.status(200).send(courses))
        .catch((err) => res.status(400).send(err.message))
});

app.get("/topics", async (req, res) => {
    prisma.topic.findMany()
        .then(topics => res.status(200).send(topics))
        .catch((err) => res.status(400).send(err.message))
});

app.get("/courses/:courseId/topics", async (req, res) => {
    const { courseId } = req.params
    prisma.course.findUnique({
        where: {
            id: courseId
        },
        select: {
            topics: true
        }
    })
        .then((course) => {
            if (!course) {
                res.status(200).send([])
            }
            else {
                res.status(200).send(course.topics)
            }
        })
        .catch((err) => res.status(400).send(err.message))
});

app.get("/courses/:courseId/semesters", async (req, res) => {
    const { courseId } = req.params
    prisma.course.findUnique({
        where: {
            id: courseId
        },
        select: {
            semesters: {
                orderBy: {
                    year: 'asc'
                }
            }
        }
    })
        .then((course) => {
            if (!course) {
                res.status(200).send([])
            }
            else {
                res.status(200).send(course.semesters)
            }
        })
        .catch((err) => res.status(400).send(err.message))
});

app.get("/courses/:courseId/:semesterId/exams", async (req, res) => {
    const { courseId, semesterId } = req.params
    prisma.exam.findMany({
        where: {
            courseId: courseId,
            semesterId: semesterId
        },
        orderBy: {
            number: 'asc'
        }
    })
        .then((exams) => res.status(200).send(exams))
        .catch((err) => res.status(400).send(err.message))
});

app.get("/exams/:examId/questions", async (req, res) => {
    const { examId } = req.params
    prisma.exam.findUnique({
        where: {
            id: examId
        },
        select: {
            questions: {
                orderBy: {
                    number: 'asc'
                }
            }
        }
    })
    .then((exam) => {
        if(exam) {
            res.status(200).send(exam.questions)
        } else {
            res.status(200).send([])
        }
    })
    .catch((err) => res.status(400).send(err.message))
})

app.get("/courses/:courseId/:topicId/questions", async (req, res) => {
    const { courseId, topicId } = req.params;
    prisma.topic.findUnique({
        where: {
            id: topicId
        },
        select: {
            questions: {
                where: {
                    id: courseId
                }
            }
        }
    })
    .then((topic) => {
        if (topic) {
            res.status(200).send(topic.questions)
        }
        else {
            res.status(200).send([])
        }
    })
    .catch((err) => res.status(400).send(err.message))
})

const storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        cb(null, true)
    }
})

const upload = multer({ storage: storage });

app.post("/convert", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            throw Error
        }
        const fileData = req.file.buffer.toString('base64');
        const response = await axios.post('https://api.mathpix.com/v3/text', {
            src: `data:${req.file.mimetype};base64,${fileData}`,
            formats: [
                "text",
                "data",
                "latex_simplified",
                "latex_styled",
                "mathml",
                "asciimath",
                "latex_list"],
            //math_inline_delimiters: ["$", "$"],
            //math_display_delimiters: ["$", "$"],
            data_options: {
                include_asciimath: true,
                include_latex: true
            }
        }, {
            headers: {
                'app_id': process.env.MATHPIX_ID,
                'app_key': process.env.MATHPIX_KEY,
                'Content-Type': 'application/json'
            }
        });
        console.log(response.data)
        res.status(200).send(response.data)
    } catch (err) {
        res.status(400).send(err);
    }
})

module.exports = app;
export {}
