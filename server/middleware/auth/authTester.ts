import asyncWrapper from '../wrappers/asyncWrapper';
import { APIError } from '../errors';

const authTester = asyncWrapper(async (req, res, next) => {
    if (req.user) {
        req.session._garbage = Date();
        req.session.touch();
        return next()
    }
    throw new APIError("Unauthenticated", 401)
})

export default authTester