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

const router = express.Router();

// CURRENTLY USED
// Get all courses
router.get("/courses", generalLimiter, sendPublished, asyncWrapper(getCourses));

// All topics metadata, no relations
router.get("/topics", generalLimiter, sendPublished, asyncWrapper(getAllTopics));

// All courses with relations. Use for testing only.
// app.get("/courses/all", generalLimiter, sendPublished, asyncWrapper(getAllCourses));

// CURRENTLY USED
// Metadata for specific course, no relations
router.get("/courses/:courseAbbrev", generalLimiter, sendPublished, asyncWrapper(getCourse));

// CURRENTLY USED
// All topics with question ids, numbers, published status. OLD VERSION: All topics for a specific course, no other relations (getCourseTopics)
router.get("/courses/:courseAbbrev/topics", generalLimiter, sendPublished, asyncWrapper(getCourseTopicsWithBasicQuestionInfo));

// All questions with topics included for a specific topic in a course.
// Includes questions from other courses.
router.get("/courses/:courseAbbrev/topics/questions", generalLimiter, sendPublished, asyncWrapper(getCourseTopicsWithBasicQuestionInfo));

// CURRENTLY USED
// All exams with question ids, numbers, published status. OLD VERSION: All exams with semester (no questions) (getCourseExams)
router.get("/courses/:courseAbbrev/exams", generalLimiter, sendPublished, asyncWrapper(getCourseExamsWithBasicQuestionInfo));

// All exams with question ids and numbers (Duplicate of "/courses/:courseAbbrev/exams")
router.get("/courses/:courseAbbrev/exams/questions", generalLimiter, sendPublished, asyncWrapper(getCourseExamsWithBasicQuestionInfo));

// CURRENTLY USED
// All questions with id, number, topics, published status for a topic in a course.
router.get("/courses/:courseAbbrev/topics/:topicName", generalLimiter, sendPublished, asyncWrapper(getCourseTopicWithBasicQuestionInfo));

// Full question information for specific topic
router.get("/courses/:courseAbbrev/topics/:topicName/questions", generalLimiter, sendPublished, asyncWrapper(getCourseTopicWithFullQuestionInfo));

// CURRENTLY USED
// All questions with id, number, and topics for an exam
router.get("/courses/:courseAbbrev/exams/:season-:year-:examNumber", generalLimiter, sendPublished, asyncWrapper(getCourseExamWithBasicQuestionInfo));

// All questions for a specific exam, includes topics within questions.
router.get("/courses/:courseAbbrev/exams/:season-:year-:examNumber/questions", generalLimiter, sendPublished, asyncWrapper(getCourseExamWithFullQuestionInfo));

// CURRENTLY USED
// Get events. Has courseId and after as query params
router.get("/events", asyncWrapper(getEvents));

// CURRENTLY USED
// Get a specific event
router.get("/events/:eventId", asyncWrapper(getEvent));

export default router;