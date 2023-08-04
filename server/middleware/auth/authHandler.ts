import { Request, Response, NextFunction } from "express";
import asyncWrapper from '../wrappers/asyncWrapper';
import { APIError } from '../errors';

const authHandler = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
        req.session._garbage = Date();
        req.session.touch();
        if (["ADMIN", "CONTENT"].includes(req.user.role)) {
            return next()
        }
    }
    throw new APIError("Unauthorized", 403)
})

export default authHandler