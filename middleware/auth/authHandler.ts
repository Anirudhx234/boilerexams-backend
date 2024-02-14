import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client"
import asyncWrapper from "../wrappers/asyncWrapper.js";
import { APIError } from "../errors/index.js";
import isWhitelisted from "../../helpers/auth/isWhiteListed.js";

const authHandler = (role: string) => asyncWrapper(async (req: Request, _res: Response, next: NextFunction) => {
    if (!role) {
        throw new APIError("Role missing in authHandler call", 500);
    }

    const levels = {
        [Role.USER]: 1,
        [Role.PROFESSOR]: 2,
        [Role.CONTENT]: 3,
        [Role.ADMIN]: 4
    }

    if (isWhitelisted(req)) {
        return next();
    }

    if (req.user) {
        req.session._garbage = Date();
        req.session.touch();

        const userLevel = levels[req.user.role]
        const authLevel = levels[role]
 
        if (userLevel >= authLevel) {
            return next();
        }
    }
    throw new APIError("Unauthorized", 403);
});

export default authHandler;
