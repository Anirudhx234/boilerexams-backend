import express from 'express'
import {
    getCourses,
    getAllTopics,
    getAllCourses,
    getCourse,
    getCourseTopics,
    getCourseTopicsWithBasicQuestionInfo,
    getCourseExams,
    getCourseExamsWithBasicQuestionInfo,
    getCourseTopicWithFullQuestionInfo,
    getCourseExamWithBasicQuestionInfo,
    getCourseExamWithFullQuestionInfo
} from '../controllers/display/nameController.js'
import asyncWrapper from '../middleware/wrappers/asyncWrapper.js'
import sendPublished from "../middleware/auth/sendPublished.js"
// import cache from '../cache/caching';

const app = express();

app.get("/courses", sendPublished, asyncWrapper(getCourses));

// All topics metadata, no relations
app.get("/topics", sendPublished, asyncWrapper(getAllTopics));

// All courses with relations
app.get("/courses/all", sendPublished, asyncWrapper(getAllCourses));

// Metadata for specific course, no relations
app.get("/courses/:courseAbbrev", sendPublished, asyncWrapper(getCourse));

// All topics for a specific course, no other relations
app.get("/courses/:courseAbbrev/topics", sendPublished, asyncWrapper(getCourseTopics));

// All questions with topics included for a specific topic in a course.
// Includes questions from other courses.
app.get("/courses/:courseAbbrev/topics/questions", sendPublished, asyncWrapper(getCourseTopicsWithBasicQuestionInfo));

// All exams with semester (no questions)
app.get("/courses/:courseAbbrev/exams", sendPublished, asyncWrapper(getCourseExams));

// All exams with question ids and numbers
app.get("/courses/:courseAbbrev/exams/questions", sendPublished, asyncWrapper(getCourseExamsWithBasicQuestionInfo))

// Full question information for specific topic
app.get("/courses/:courseAbbrev/topics/:topicName/questions", sendPublished, asyncWrapper(getCourseTopicWithFullQuestionInfo));

// All questions with id, number, and topics for an exam
app.get("/courses/:courseAbbrev/exams/:season-:year-:examNumber", sendPublished, asyncWrapper(getCourseExamWithBasicQuestionInfo))

// All questions for a specific exam, includes topics within questions.
app.get("/courses/:courseAbbrev/exams/:season-:year-:examNumber/questions", sendPublished, asyncWrapper(getCourseExamWithFullQuestionInfo));

export default app