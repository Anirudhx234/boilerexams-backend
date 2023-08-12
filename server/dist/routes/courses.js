import express from 'express';
import { createCourse, updateCourse, deleteCourse, toggleCoursePublished } from "../controllers/courseController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import authHandler from '../middleware/auth/authHandler.js';
import upload from "../middleware/multer/image.js";
const app = express();
app.post("/courses", authHandler, upload.single('image'), asyncWrapper(createCourse));
app.put("/courses/:courseId", authHandler, upload.single('image'), asyncWrapper(updateCourse));
app.put("/courses/:courseId/togglePublished", authHandler, asyncWrapper(toggleCoursePublished));
app.delete("/courses/:courseId/hardDelete", authHandler, asyncWrapper(deleteCourse));
export default app;
//# sourceMappingURL=courses.js.map