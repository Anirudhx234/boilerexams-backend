import express from 'express';
import {
    getAllCourses,
    getAllTopics,
    getCourse,
    getCourseExamWithBasicQuestionInfo,
    getCourseExamWithFullQuestionInfo,
    getCourseExams,
    getCourseExamsWithBasicQuestionInfo,
    getCourseTopicWithFullQuestionInfo,
    getCourseTopics,
    getCourseTopicsWithBasicQuestionInfo,
    getCourses
} from '../controllers/display/nameController.js';
import asyncWrapper from '../middleware/wrappers/asyncWrapper.js';
import sendPublished from "../middleware/auth/sendPublished.js";
import generalLimiter from '../middleware/rateLimiting/generalLimiter.js';
import {getEvent, getEvents} from "../controllers/eventController.js";
// import cache from '../cache/caching';

const app = express();

app.get("/courses", generalLimiter, sendPublished, asyncWrapper(getCourses));

// All topics metadata, no relations
app.get("/topics", generalLimiter, sendPublished, asyncWrapper(getAllTopics));

// All courses with relations
app.get("/courses/all", generalLimiter, sendPublished, asyncWrapper(getAllCourses));

// Metadata for specific course, no relations
app.get("/courses/:courseAbbrev", generalLimiter, sendPublished, asyncWrapper(getCourse));

// All topics for a specific course, no other relations
app.get("/courses/:courseAbbrev/topics", generalLimiter, sendPublished, asyncWrapper(getCourseTopics));

// All questions with topics included for a specific topic in a course.
// Includes questions from other courses.
app.get("/courses/:courseAbbrev/topics/questions", generalLimiter, sendPublished, asyncWrapper(getCourseTopicsWithBasicQuestionInfo));

// All exams with semester (no questions)
app.get("/courses/:courseAbbrev/exams", generalLimiter, sendPublished, asyncWrapper(getCourseExams));

// All exams with question ids and numbers
app.get("/courses/:courseAbbrev/exams/questions", generalLimiter, sendPublished, asyncWrapper(getCourseExamsWithBasicQuestionInfo));

// Full question information for specific topic
app.get("/courses/:courseAbbrev/topics/:topicName/questions", generalLimiter, sendPublished, asyncWrapper(getCourseTopicWithFullQuestionInfo));

// All questions with id, number, and topics for an exam
app.get("/courses/:courseAbbrev/exams/:season-:year-:examNumber", generalLimiter, sendPublished, asyncWrapper(getCourseExamWithBasicQuestionInfo));

// All questions for a specific exam, includes topics within questions.
app.get("/courses/:courseAbbrev/exams/:season-:year-:examNumber/questions", generalLimiter, sendPublished, asyncWrapper(getCourseExamWithFullQuestionInfo));

// Get events. Has courseId and after as query params
app.get("/events", asyncWrapper(getEvents));

// Get a specific event
app.get("/events/:eventId", asyncWrapper(getEvent));

export default app;