import { Role, User } from "@prisma/client";
import { APIError } from "../errors/index.js";

const isAuthorized = (user: User, role: string) => {
    if (!user) {
        return false;
    }

    if (!role) {
        throw new APIError("Role missing in isAuthorized call", 500);
    }

    const levels = {
        [Role.USER]: 1,
        [Role.PROFESSOR]: 2,
        [Role.CONTENT]: 3,
        [Role.ADMIN]: 4,
    };

    const userLevel = levels[user.role];
    const authLevel = levels[role];

    if (userLevel >= authLevel) {
        return true;
    }

    return false;
};

export default isAuthorized;
