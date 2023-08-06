import express from 'express'
import {
    createCourse,
    updateCourse,
    deleteCourse,
    toggleCoursePublished
} from "../controllers/courseController"
import asyncWrapper from "../middleware/wrappers/asyncWrapper"
import authHandler from '../middleware/auth/authHandler';

const app = express();

app.post("/courses", authHandler, asyncWrapper(createCourse))

app.put("/courses/:courseId", authHandler, asyncWrapper(updateCourse))

app.put("/courses/:courseId/togglePublished", authHandler, asyncWrapper(toggleCoursePublished))

app.delete("/courses/:courseId/hardDelete", authHandler, asyncWrapper(deleteCourse))

export default app