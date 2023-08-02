import asyncWrapper from '../wrappers/asyncWrapper';
import { APIError } from '../errors';

const authHandler = asyncWrapper(async (req, res, next) => {
    if (req.user) {
        req.session._garbage = Date();
        req.session.touch();
        if (["ADMIN", "CONTENT"].includes(req.user.role)) {
            return next()
        }
    }
    throw new APIError("Unauthorized", 401)
})

export default authHandler