import { NextFunction, Request, Response } from "express";
import asyncWrapper from "../wrappers/asyncWrapper.js";

const sendPublished = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
        req.session._garbage = Date();
        req.session.touch();
        if (["ADMIN", "CONTENT", "TESTER"].includes(req.user.role)) {
            req.sendUnpublished = true;
        }
    } else {
        req.sendUnpublished = false;
    }
    return next();
});

export default sendPublished;
