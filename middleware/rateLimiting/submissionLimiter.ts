import { rateLimit } from "express-rate-limit";
import isWhitelisted from "../auth/isWhiteListed.js";

const submissionLimiter = rateLimit({
    windowMs: 5000,
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

export default submissionLimiter;
