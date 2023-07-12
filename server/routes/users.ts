import { NotFoundError } from "../middleware/errors";

const { PrismaClient, Role } = require('@prisma/client')
const prisma = new PrismaClient();

const express = require('express');
const app = express();

const asyncWrapper = require("../middleware/wrappers/asyncWrapper")

app.get("/users/all", asyncWrapper(async (req, res) => {
    const users = await prisma.user.findMany({
        include: {
            courses: true
        }
    })
    if (!users.length) {
        throw new NotFoundError("No users found");
    }
    res.status(200).send(users)
}))

app.get("/users/:userId", asyncWrapper(async (req, res) => {
    const { userId } = req.params
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            courses: true
        }
    })
    if (!user) {
        throw new NotFoundError("User not found");
    }
    res.status(200).send(user)
}))

app.put("/users/:userId/updateRole", asyncWrapper(async (req, res) => {
    const { userId } = req.params
    const { role } = req.body

    if (!role || typeof(role) !== "string" || !Role[role.toUpperCase() as keyof typeof Role]) {
        throw new Error("Role must be USER, CONTENT, or ADMIN")
    }
    const user = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            role: Role[role.toUpperCase() as keyof typeof Role]
        },
        include: {
            courses: true
        }
    })
    if (!user) {
        throw new NotFoundError("User not found");
    }
    res.status(200).send(user)
}))

app.put("/users/:userId/assignCourses", asyncWrapper(async (req, res) => {
    const { userId } = req.params
    const { courseIds } = req.body

    const validRoles = [Role.CONTENT, Role.ADMIN]

    const user = await prisma.user.findFirst({
        where: {
            id: userId,
            role: {
                in: validRoles
            }
        }
    })
    if (!user) {
        return res.status(401).send("User not authorized or not found")
    }

    const resp = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            courses: {
                set: courseIds.map((courseId) => ({ id: courseId }))
            }
        },
        include: {
            courses: true
        }
    })
    res.status(200).send(resp)
}))

app.delete("/users/:userId", asyncWrapper(async (req, res) => {
    const { userId } = req.params
    const user = prisma.user.delete({
        where: {
            id: userId
        }
    })
    res.status(200).send(user)
}))

module.exports = app
export { }