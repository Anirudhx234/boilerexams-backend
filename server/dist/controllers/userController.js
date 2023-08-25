var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import prisma from "../libs/prisma.js";
import { Role } from '@prisma/client';
import { APIError, NotFoundError } from "../middleware/errors/index.js";
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma.user.findMany({
        include: {
            courses: true
        }
    });
    if (!users.length) {
        throw new NotFoundError("No users found");
    }
    res.status(200).send(users);
});
const getUserMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findUnique({
        where: {
            id: req.user.id
        },
        include: {
            courses: true
        }
    });
    return res.status(200).send(user);
});
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const user = yield prisma.user.findUnique({
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
});
const updateUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { role } = req.body;
    if (!role || typeof (role) !== "string" || !Role[role.toUpperCase()]) {
        throw new Error("Role must be USER, CONTENT, or ADMIN");
    }
    const user = yield prisma.user.update({
        where: {
            id: userId
        },
        data: {
            role: Role[role.toUpperCase()]
        },
        include: {
            courses: true
        }
    });
    if (!user) {
        throw new NotFoundError("User not found");
    }
    res.status(200).send(user);
});
const assignUserCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { courseIds } = req.body;
    const validRoles = [Role.CONTENT, Role.ADMIN];
    const user = yield prisma.user.findFirst({
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
    const resp = yield prisma.user.update({
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
});
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const user = prisma.user.delete({
        where: {
            id: userId
        }
    });
    res.status(200).send(user);
});
export { getAllUsers, getUserMe, getUser, updateUserRole, assignUserCourses, deleteUser };
//# sourceMappingURL=userController.js.map