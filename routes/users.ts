import express from 'express';
import {
    assignUserCourses,
    deleteUser,
    getAllUsers,
    getUser,
    getUserMe,
    updateUserRole
} from "../controllers/userController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import authHandler from '../middleware/auth/authHandler.js';
import authTester from '../middleware/auth/authTester.js';

const router = express.Router();

router.get("/all", authHandler, asyncWrapper(getAllUsers));

router.get("/me", authTester, asyncWrapper(getUserMe));

router.get("/:userId", authHandler, asyncWrapper(getUser));

router.put("/:userId/updateRole", authHandler, asyncWrapper(updateUserRole));

router.put("/:userId/assignCourses", authHandler, asyncWrapper(assignUserCourses));

router.delete("/:userId", authHandler, asyncWrapper(deleteUser));

export default router;