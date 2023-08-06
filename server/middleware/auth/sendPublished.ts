import { Request, Response, NextFunction } from "express"
import asyncWrapper from '../wrappers/asyncWrapper';

const sendPublished = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
        req.session._garbage = Date();
        req.session.touch();
        if (["ADMIN", "CONTENT"].includes(req.user.role)) {
            req.published = [{ published: true }, { published: false }]
            return next()
        }
    }
    req.published = [{ published: true }]
    return next()
})

export default sendPublished