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

const app = express();

app.get("/all", authHandler, asyncWrapper(getAllUsers));

app.get("/me", authTester, asyncWrapper(getUserMe));

app.get("/:userId", authHandler, asyncWrapper(getUser));

app.put("/:userId/updateRole", authHandler, asyncWrapper(updateUserRole));

app.put("/:userId/assignCourses", authHandler, asyncWrapper(assignUserCourses));

app.delete("/:userId", authHandler, asyncWrapper(deleteUser));

export default app;