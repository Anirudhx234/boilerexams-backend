import { rateLimit } from 'express-rate-limit';
import isWhitelisted from "../../helpers/auth/isWhiteListed.js";

const feedbackLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req) => {
        return isWhitelisted(req);
    }
});

export default feedbackLimiter;