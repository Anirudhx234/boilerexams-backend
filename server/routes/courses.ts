import express from 'express'
import {
    createCourse,
    updateCourse,
    deleteCourse,
    toggleCoursePublished
} from "../controllers/courseController"
import asyncWrapper from "../middleware/wrappers/asyncWrapper"
import authorizedHandler from '../middleware/auth/authHandler';

const app = express();

app.post("/courses", authorizedHandler, asyncWrapper(createCourse))

app.put("/courses/:courseId", authorizedHandler, asyncWrapper(updateCourse))

app.put("/courses/:courseId/togglePublished", authorizedHandler, asyncWrapper(toggleCoursePublished))

app.delete("/courses/:courseId/hardDelete", authorizedHandler, asyncWrapper(deleteCourse))

export default app