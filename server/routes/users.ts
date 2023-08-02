import express from 'express'
import {
    getAllUsers,
    getUserMe,
    getUser,
    updateUserRole,
    assignUserCourses,
    deleteUser
} from "../controllers/userController"
import asyncWrapper from "../middleware/wrappers/asyncWrapper"
import authHandler from '../middleware/auth/authHandler';
import authTester from '../middleware/auth/authTester';

const app = express();

app.get("/users/all", authHandler, asyncWrapper(getAllUsers))

app.get("/users/me", authTester, asyncWrapper(getUserMe))

app.get("/users/:userId", authHandler, asyncWrapper(getUser))

app.put("/users/:userId/updateRole", authHandler, asyncWrapper(updateUserRole))

app.put("/users/:userId/assignCourses", authHandler, asyncWrapper(assignUserCourses))

app.delete("/users/:userId", authHandler, asyncWrapper(deleteUser))

export default app