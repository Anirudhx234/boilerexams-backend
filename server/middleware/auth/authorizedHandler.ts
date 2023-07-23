import asyncWrapper from '../wrappers/asyncWrapper';
import { APIError } from '../errors';

const authorizedHandler = asyncWrapper(async (req, res, next) => {
    if (req.user) {
        req.session.resetMaxAge();
        req.session.save();
        if (["ADMIN", "CONTENT"].includes(req.user.role)) {
            req.published = [{ published: true }, { published: false }]
            return next()
        }
    }
    throw new APIError("Unauthorized", 401)
})

export default authorizedHandler