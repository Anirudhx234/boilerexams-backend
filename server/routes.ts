import express from 'express'
import { PrismaClient, Season } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()

const multer = require('multer');
const Aws = require('aws-sdk');

const dotenv = require("dotenv");
dotenv.config();

app.post("/add-course", async (req, res) => {
    const { code, name } = req.body
    prisma.course.create({
        data: {
            code: code,
            name: name
        }
    })
    .then((resp) => res.status(200).send(resp))
    .catch((err) => res.status(400).send(err.message))
});

app.post("/add-exam", async (req, res) => {
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

app.post("/add-topic", async (req, res) => {
    const { name } = req.body
    prisma.topic.create({
        data: {
            name: name
        }
    })
    .then(() => res.status(200).send("success"))
    .catch((err) => res.status(400).send(err.message));
});

app.post("/add-course-topics", async (req, res) => {
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

app.post("/add-semester");
app.post("/add-question");

app.get("/get-courses", async (req, res) => {
    prisma.course.findMany()
    .then((courses) => res.status(200).send(courses))
    .catch((err) => res.status(400).send(err.message))
});

app.get("/get-topics", async (req, res) => {
    prisma.topic.findMany()
    .then(topics => res.status(200).send(topics))
    .catch((err) => res.status(400).send(err.message))
});

app.post("/get-course-topics", async (req, res) => {
    const { course } = req.body
    prisma.course.findUnique({
        where: {
            id: course
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

app.post("/get-semesters", async (req, res) => {
    const { course } = req.body
    prisma.course.findUnique({
        where: {
            id: course
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

app.post("/get-exams", async (req, res) => {
    const { course, semester } = req.body
    prisma.exam.findMany({
        where: {
            courseId: course,
            semesterId: semester
        },
        orderBy: {
            number: 'asc'
        }
    })
    .then((exams) => res.status(200).send(exams))
    .catch((err) => res.status(400).send(err.message))
});

/*
const storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        cb(null, '')
    }
})

const filefilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const upload = multer({ storage: storage });

const s3 = new Aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

app.post("/upload-image", upload.single("file"), async (req, res) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: req.file.originalname,
        Body: req.file.buffer,
        ACL: "public-read-write",
    };

    s3.upload(params, (error, data) => {
        if (error) {
            console.log(error);
            res.status(500).send({ "err": error })
        }

        console.log(data)

        const problem = new question({
            course: req.body.course,
            topic: req.body.topic,
            date: req.body.date,
            exam: req.body.exam,
            question: req.body.question,
            image_url: data.Location
        });
        problem.save().then((response) => {
            res.status(200).send(data.Location);
            console.log("upload successful");
        })
            .catch((err) => {
                res.send(400, "Bad Request");
                console.log(err);
            })
    })
});

app.post("/get-question", upload.none(), async (req, res) => {
    console.log(req.body);
    if (req.body.exam) {
        req.body.exam = Number(req.body.exam);
    }
    if (req.body.question) {
        req.body.question = Number(req.body.question);
    }
    record.aggregate([
        { $match: req.body },
        { $sample: { size: 1 } }
    ])
        .then(problem => {
            res.status(200).send(problem[0].image_url)
        })
        .catch(error => {
            res.status(400).send("");
        })
});*/

module.exports = app;