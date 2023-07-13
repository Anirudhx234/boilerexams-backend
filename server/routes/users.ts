const express = require('express');
const app = express();
const {
    getAllUsers,
    getUser,
    updateUserRole,
    assignUserCourses,
    deleteUser
} = require("../controllers/userController")
const asyncWrapper = require("../middleware/wrappers/asyncWrapper")

app.get("/users/all", asyncWrapper(getAllUsers))

app.get("/users/:userId", asyncWrapper(getUser))

app.put("/users/:userId/updateRole", asyncWrapper(updateUserRole))

app.put("/users/:userId/assignCourses", asyncWrapper(assignUserCourses))

app.delete("/users/:userId", asyncWrapper(deleteUser))

module.exports = app
export { }