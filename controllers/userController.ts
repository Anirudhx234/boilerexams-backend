import prisma from "../prisma/prisma.js";
import { Role } from "@prisma/client";
import { Request, Response } from "express";
import { APIError, NotFoundError } from "../middleware/errors/index.js";
import { z } from "zod";

export const AssignCourseOptions = z.array(z.string().uuid());

export async function getMe(req: Request, res: Response) {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: req.user.id,
        },
        include: {
            courses: true,
        },
    });

    return res.status(200).send(user);
}

export async function getUser(req: Request, res: Response) {
    const { userId } = req.params;

    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId,
        },
        include: {
            courses: true,
        },
    });

    res.status(200).send(user);
}

export async function getAllUsers(req: Request, res: Response) {
    const users = await prisma.user.findMany({
        include: {
            courses: true,
        },
        orderBy: [
            { role: "desc" },
            { name: "asc" },
        ]
    });

    res.status(200).send(users);
}

export async function updateUserRole(req: Request, res: Response) {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || typeof role !== "string" || !Role[role.toUpperCase() as keyof typeof Role]) {
        throw new Error("Role must be USER, CONTENT, or ADMIN");
    }
    const user = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            role: Role[role.toUpperCase() as keyof typeof Role],
        },
        include: {
            courses: true,
        },
    });
    if (!user) {
        throw new NotFoundError("User not found");
    }
    res.status(200).send(user);
}

export async function assignUserCourses(req: Request, res: Response) {
    const { userId } = req.params;
    const options = AssignCourseOptions.parse(req.body);

    const validRoles = [ Role.CONTENT, Role.PROFESSOR, Role.ADMIN ];

    const user = await prisma.user.update({
        where: {
            id: userId,
            role: {
                in: validRoles,
            }
        },
        data: {
            courses: {
                set: options.map(courseId => ({ id: courseId })),
            },
        },
        include: {
            courses: true,
        },
    });

    if (!user) {
        throw new APIError("User must have role CONTENT or PROFESSOR or ADMIN", 403);
    }

    res.status(200).send(user);
}

export async function deleteUser(req: Request, res: Response) {
    const { userId } = req.params;

    const user = await prisma.user.delete({
        where: {
            id: userId,
        },
    });

    res.status(200).send(user);
}