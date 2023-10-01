import prisma from "../libs/prisma.js";
import { Role } from '@prisma/client';
import { Request, Response } from 'express';
import { APIError, NotFoundError } from "../middleware/errors/index.js";

const getAllUsers = async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
        include: {
            courses: true
        }
    });
    if (!users.length) {
        throw new NotFoundError("No users found");
    }
    res.status(200).send(users);
};

const getUserMe = async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.user.id
        },
        include: {
            courses: true
        }
    });
    return res.status(200).send(user);
};

const getUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            courses: true
        }
    });
    if (!user) {
        throw new NotFoundError("User not found");
    }
    res.status(200).send(user);
};

const updateUserRole = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || typeof (role) !== "string" || !Role[role.toUpperCase() as keyof typeof Role]) {
        throw new Error("Role must be USER, CONTENT, or ADMIN");
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
    });
    if (!user) {
        throw new NotFoundError("User not found");
    }
    res.status(200).send(user);
};

const assignUserCourses = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { courseIds } = req.body;

    const validRoles = [Role.CONTENT, Role.ADMIN];

    const user = await prisma.user.findFirst({
        where: {
            id: userId,
            role: {
                in: validRoles
            }
        }
    });
    if (!user) {
        throw new APIError("User must have role CONTENT or ADMIN, or not found", 403);
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
    });
    res.status(200).send(resp);
};

const deleteUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = prisma.user.delete({
        where: {
            id: userId
        }
    });
    res.status(200).send(user);
};

export {
    getAllUsers,
    getUserMe,
    getUser,
    updateUserRole,
    assignUserCourses,
    deleteUser
};