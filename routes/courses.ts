import express from "express";
import { createCourse, deleteCourse, toggleCoursePublished, updateCourse } from "../controllers/courseController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import upload from "../middleware/multer/image.js";

const router = express.Router();

router.post("/courses", upload.single("image"), asyncWrapper(createCourse));

router.put("/courses/:courseResolvable", upload.single("image"), asyncWrapper(updateCourse));

router.put("/courses/:courseResolvable/togglePublished", asyncWrapper(toggleCoursePublished));

router.delete("/courses/:courseResolvable/hardDelete", asyncWrapper(deleteCourse));

export default router;
