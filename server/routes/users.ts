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
import authorizedHandler from '../middleware/auth/authHandler';

const app = express();

app.get("/users/all", authorizedHandler, asyncWrapper(getAllUsers))

app.get("/users/me", authorizedHandler, asyncWrapper(getUserMe))

app.get("/users/:userId", authorizedHandler, asyncWrapper(getUser))

app.put("/users/:userId/updateRole", authorizedHandler, asyncWrapper(updateUserRole))

app.put("/users/:userId/assignCourses", authorizedHandler, asyncWrapper(assignUserCourses))

app.delete("/users/:userId", authorizedHandler, asyncWrapper(deleteUser))

export default app