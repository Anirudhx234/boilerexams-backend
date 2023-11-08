import { rateLimit } from 'express-rate-limit';

const feedbackLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req) => {
        if (req.user) return true;
        if (!process.env.FEEDBACK_API_KEY) return false;
        return req.headers.authorization == process.env.FEEDBACK_API_KEY;
    }
});

export default feedbackLimiter;