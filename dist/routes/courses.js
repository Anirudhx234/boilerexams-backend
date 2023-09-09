import express from 'express';
import { createCourse, updateCourse, deleteCourse, toggleCoursePublished } from "../controllers/courseController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import upload from "../middleware/multer/image.js";
const app = express();
app.post("/courses", upload.single('image'), asyncWrapper(createCourse));
app.put("/courses/:courseId", upload.single('image'), asyncWrapper(updateCourse));
app.put("/courses/:courseId/togglePublished", asyncWrapper(toggleCoursePublished));
app.delete("/courses/:courseId/hardDelete", asyncWrapper(deleteCourse));
export default app;
//# sourceMappingURL=courses.js.map