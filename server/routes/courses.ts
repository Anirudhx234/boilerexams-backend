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

app.put("/courses/togglePublished/:courseId", asyncWrapper(toggleCoursePublished))

app.delete("/courses/hardDelete/:courseId", asyncWrapper(deleteCourse))

export default app