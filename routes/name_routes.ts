import express from 'express';
import {
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
} from '../controllers/display/nameController.js';
import asyncWrapper from '../middleware/wrappers/asyncWrapper.js';
import sendPublished from "../middleware/auth/sendPublished.js";
import generalLimiter from '../middleware/rateLimiting/generalLimiter.js';
import { getEvent, getEvents } from "../controllers/eventController.js";
// import cache from '../cache/caching';

const app = express();

// CURRENTLY USED
// Get all courses
app.get("/courses", generalLimiter, sendPublished, asyncWrapper(getCourses));

// All topics metadata, no relations
app.get("/topics", generalLimiter, sendPublished, asyncWrapper(getAllTopics));

// All courses with relations. Use for testing only.
// app.get("/courses/all", generalLimiter, sendPublished, asyncWrapper(getAllCourses));

// CURRENTLY USED
// Metadata for specific course, no relations
app.get("/courses/:courseAbbrev", generalLimiter, sendPublished, asyncWrapper(getCourse));

// CURRENTLY USED
// All topics with question ids, numbers, published status. OLD VERSION: All topics for a specific course, no other relations (getCourseTopics)
app.get("/courses/:courseAbbrev/topics", generalLimiter, sendPublished, asyncWrapper(getCourseTopicsWithBasicQuestionInfo));

// All questions with topics included for a specific topic in a course.
// Includes questions from other courses.
app.get("/courses/:courseAbbrev/topics/questions", generalLimiter, sendPublished, asyncWrapper(getCourseTopicsWithBasicQuestionInfo));

// CURRENTLY USED
// All exams with question ids, numbers, published status. OLD VERSION: All exams with semester (no questions) (getCourseExams)
app.get("/courses/:courseAbbrev/exams", generalLimiter, sendPublished, asyncWrapper(getCourseExamsWithBasicQuestionInfo));

// All exams with question ids and numbers (Duplicate of "/courses/:courseAbbrev/exams")
app.get("/courses/:courseAbbrev/exams/questions", generalLimiter, sendPublished, asyncWrapper(getCourseExamsWithBasicQuestionInfo));

// CURRENTLY USED
// All questions with id, number, topics, published status for a topic in a course.
app.get("/courses/:courseAbbrev/topics/:topicName", generalLimiter, sendPublished, asyncWrapper(getCourseTopicWithBasicQuestionInfo));

// Full question information for specific topic
app.get("/courses/:courseAbbrev/topics/:topicName/questions", generalLimiter, sendPublished, asyncWrapper(getCourseTopicWithFullQuestionInfo));

// CURRENTLY USED
// All questions with id, number, and topics for an exam
app.get("/courses/:courseAbbrev/exams/:season-:year-:examNumber", generalLimiter, sendPublished, asyncWrapper(getCourseExamWithBasicQuestionInfo));

// All questions for a specific exam, includes topics within questions.
app.get("/courses/:courseAbbrev/exams/:season-:year-:examNumber/questions", generalLimiter, sendPublished, asyncWrapper(getCourseExamWithFullQuestionInfo));

// CURRENTLY USED
// Get events. Has courseId and after as query params
app.get("/events", asyncWrapper(getEvents));

// CURRENTLY USED
// Get a specific event
app.get("/events/:eventId", asyncWrapper(getEvent));

export default app;