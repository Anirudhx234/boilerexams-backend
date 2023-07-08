const { PrismaClient, Role } = require('@prisma/client')
const prisma = new PrismaClient();

const express = require('express');
const app = express();

app.get("/users/all", async (req, res) => {
    prisma.user.findMany()
        .then((resp) => res.status(200).send(resp))
        .catch((err) => res.status(400).send(err))
})

app.get("/users/:userId", async (req, res) => {
    try {
        const { userId } = req.params
        prisma.user.findUnique({
            where: {
                id: userId
            }
        })
            .then((resp) => res.status(200).send(resp))
            .catch((err) => res.status(400).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
})

app.put("/users/:userId/updateRole", async (req, res) => {
    try {
        const { userId } = req.params
        const { role } = req.body
        prisma.user.update({
            where: {
                id: userId
            },
            data: {
                role: Role[role.toUpperCase() as keyof typeof Role]
            }
        })
            .then((resp) => res.status(200).send(resp))
            .catch((err) => res.status(400).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
})

app.put("/users/:userId/assignCourses", async (req, res) => {
    try {
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

        prisma.user.update({
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
            .then((resp) => res.status(200).send(resp))
            .catch((err) => res.status(400).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
})

app.delete("/users/:userId", async (req, res) => {
    try {
        const { userId } = req.params
        prisma.user.delete({
            where: {
                id: userId
            }
        })
            .then((resp) => res.status(200).send(resp))
            .catch((err) => res.status(400).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = app
export { }