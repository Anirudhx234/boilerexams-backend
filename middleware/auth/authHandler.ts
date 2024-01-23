import { NextFunction, Request, Response } from "express";
import asyncWrapper from '../wrappers/asyncWrapper.js';
import { APIError } from '../errors/index.js';
import isWhitelisted from "../../helpers/auth/isWhiteListed.js";

const authHandler = asyncWrapper(async (req: Request, _res: Response, next: NextFunction) => {
    if (isWhitelisted(req)) return next();
    if (req.user) {
        req.session._garbage = Date();
        req.session.touch();
        if (["ADMIN", "CONTENT", "PROFESSOR"].includes(req.user.role)) {
            return next();
        }
    }
    throw new APIError("Unauthorized", 403);
});

export default authHandler;
