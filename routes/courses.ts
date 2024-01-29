import express from "express";
import { createCourse, deleteCourse, toggleCoursePublished, updateCourse } from "../controllers/courseController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import upload from "../middleware/multer/image.js";

const router = express.Router();

router.post("/courses", upload.single("image"), asyncWrapper(createCourse));

router.put("/courses/:courseId", upload.single("image"), asyncWrapper(updateCourse));

router.put("/courses/:courseId/togglePublished", asyncWrapper(toggleCoursePublished));

router.delete("/courses/:courseId/hardDelete", asyncWrapper(deleteCourse));

export default router;
