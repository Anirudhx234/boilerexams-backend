import express from 'express'
import {
    createCourse,
    updateCourse,
    deleteCourse,
    toggleCoursePublished
} from "../controllers/courseController"
import asyncWrapper from "../middleware/wrappers/asyncWrapper"

const app = express();

app.post("/courses", asyncWrapper(createCourse))

app.put("/courses/:courseId", asyncWrapper(updateCourse))

app.put("/courses/:courseId/togglePublished", asyncWrapper(toggleCoursePublished))

app.delete("/courses/:courseId/hardDelete", asyncWrapper(deleteCourse))

export default app