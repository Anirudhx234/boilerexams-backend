import express from 'express'
import {
    getAllUsers,
    getUser,
    updateUserRole,
    assignUserCourses,
    deleteUser
} from "../controllers/userController"
import asyncWrapper from "../middleware/wrappers/asyncWrapper"

const app = express();

app.get("/users/all", asyncWrapper(getAllUsers))

app.get("/users/:userId", asyncWrapper(getUser))

app.put("/users/:userId/updateRole", asyncWrapper(updateUserRole))

app.put("/users/:userId/assignCourses", asyncWrapper(assignUserCourses))

app.delete("/users/:userId", asyncWrapper(deleteUser))

export default app