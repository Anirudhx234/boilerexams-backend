import express from 'express'
import {
    createCourse,
    updateCourse,
    unpublishCourse,
    deleteCourse
} from "../controllers/courseController"
import asyncWrapper from "../middleware/wrappers/asyncWrapper"

const app = express();

app.post("/courses", asyncWrapper(createCourse))

app.put("/courses/:courseId", asyncWrapper(updateCourse))

app.delete("/courses/softDelete/:courseId", asyncWrapper(unpublishCourse))

app.delete("/courses/hardDelete/:courseId", asyncWrapper(deleteCourse))

export default app