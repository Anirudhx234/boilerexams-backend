import { NextFunction, Request, Response } from "express";
import asyncWrapper from '../wrappers/asyncWrapper.js';
import { APIError } from '../errors/index.js';

const authHandler = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
        //@ts-ignore
        req.session._garbage = Date();
        req.session.touch();
        if (["ADMIN", "CONTENT", "PROFESSOR"].includes(req.user.role)) {
            return next();
        }
    }
    throw new APIError("Unauthorized", 403);
});

export default authHandler;