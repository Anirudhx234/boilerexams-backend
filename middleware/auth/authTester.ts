import { NextFunction, Request, Response } from "express";
import asyncWrapper from "../wrappers/asyncWrapper.js";
import { APIError } from "../errors/index.js";

const authTester = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
        req.session._garbage = Date();
        req.session.touch();
    
        return next();
    }
    throw new APIError("Unauthenticated", 401);
});

export default authTester;
