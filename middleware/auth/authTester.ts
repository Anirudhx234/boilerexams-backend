import { NextFunction, Request, Response } from "express";
import APIError from "../errors/APIError.js";
import asyncWrapper from "../wrappers/asyncWrapper.js";

const authTester = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
        req.session._garbage = Date();
        req.session.touch();

        return next();
    }
    throw new APIError("Unauthenticated", 401);
});

export default authTester;
