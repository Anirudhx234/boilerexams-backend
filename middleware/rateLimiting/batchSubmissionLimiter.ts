import { rateLimit } from "express-rate-limit";
import isWhitelisted from "../auth/isWhiteListed.js";

const batchSubmissionLimiter = rateLimit({
    windowMs: 1000 * 60 * 10,
    max: 1, // 2 << 4
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        req.submissionLimited = true;
        next();
    },
    skip: (req) => {
        return isWhitelisted(req);
    }
});

export default batchSubmissionLimiter;
