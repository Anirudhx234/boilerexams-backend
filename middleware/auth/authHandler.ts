import { NextFunction, Request, Response } from "express";
import asyncWrapper from '../wrappers/asyncWrapper.js';
import { APIError } from '../errors/index.js';

const authHandler = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
        // @ts-expect-error _garbage is real
        req.session._garbage = Date();
        req.session.touch();
        if (["ADMIN", "CONTENT"].includes(req.user.role)) {
            return next();
        }
        if (process.env.FEEDBACK_API_KEY && req.headers.authorization == process.env.FEEDBACK_API_KE) {
            return next();
        }
    }
    throw new APIError("Unauthorized", 403);
});

export default authHandler;