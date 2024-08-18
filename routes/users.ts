import express from "express";
import { Role } from "@prisma/client";
import authHandler from "../middleware/auth/authHandler.js";
import authTester from "../middleware/auth/authTester.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import { assignUserCourses, deleteUser, getAllUsers, getUser, getMe, updateUserRole } from "../controllers/userController.js";

const router = express.Router();

router.get("/all", authHandler(Role.ADMIN), asyncWrapper(getAllUsers));

router.get("/me", authTester, asyncWrapper(getMe));

router.get("/:userId", authHandler(Role.ADMIN), asyncWrapper(getUser));

router.put("/:userId/update-role", authHandler(Role.ADMIN), asyncWrapper(updateUserRole));

router.put("/:userId/assign-courses", authHandler(Role.ADMIN), asyncWrapper(assignUserCourses));

router.delete("/:userId", authHandler(Role.ADMIN), asyncWrapper(deleteUser));

export default router;
