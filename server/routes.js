const express = require("express");
const course = require("./models/course.js");
const exam = require("./models/exam.js");
const semester = require("./models/semester.js");
const topic = require("./models/topic.js");
const question = require("./models/question.js");
const app = express();

const multer = require('multer');
const Aws = require('aws-sdk');

const dotenv = require("dotenv");
dotenv.config();

const storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        cb(null, '')
    }
})

//const filefilter = (req, file, cb) => {
//    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
//        cb(null, true)
//    } else {
//        cb(null, false)
//    }
//}

const upload = multer({ storage: storage });

const s3 = new Aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

app.post("/add-course", async (req, res) => {
    course.create(req.body)
        .then(() => res.status(200).send("success"))
        .catch((err) => res.status(400).send(err.message));
});

app.post("/add-exam", async (req, res) => {
    try {
        let sem = await semester.findOne({ season: req.body.season, year: req.body.year });
        if (!sem) {
            sem = await semester.create({ season: req.body.season, year: req.body.year });
        }
        let ex = await exam.create({ course: req.body.course, examNumber: req.body.number, semester: sem });
        await course.updateOne(
            { _id: req.body.course },
            { $addToSet: { exams: ex._id, semesters: sem._id }}
        );
        res.status(200).send("success");
    } catch (err) {
        res.status(400).send(err.message);
    }
})

app.post("/add-topic");
app.post("/add-semester");
app.post("/add-question");

app.get("/get-courses", async (req, res) => res.json(await course.find({})));

app.post("/get-topics", async (req, res) => {
    const courseTopics = await course.findById(req.body.course).populate("topics");
    if (courseTopics) {
        res.json(courseTopics.topics);
    } else {
        res.status(400).send("No course found");
    }
});

app.post("/get-semesters", async (req, res) => {
    const courseSemesters = await course.findById(req.body.course).populate("semesters");
    if (courseSemesters) {
        res.json(courseSemesters.semesters);
    } else {
        res.status(400).send("No course found");
    }
});

app.post("/get-exams", async (req, res) => {
    const courseExams = await course.findById(req.body.course).populate("exams");
    if (courseExams) {
        res.json(courseExams.exams);
    } else {
        res.status(400).send("No course found");
    }
});

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
});

module.exports = app;