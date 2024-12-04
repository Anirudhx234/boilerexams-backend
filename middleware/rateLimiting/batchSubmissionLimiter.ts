import { rateLimit } from "express-rate-limit";
import isWhitelisted from "../auth/isWhiteListed.js";
import keyGen from "./keyGen.js";

const batchSubmissionLimiter = rateLimit({
    windowMs: 1000 * 60 * 10,
    max: 1, // 2 << 4
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: keyGen,
    handler: (req, res, next, options) => {
        req.submissionLimited = true;
        next();
    },
    skip: (req) => {
        return isWhitelisted(req);
    }
});

export default batchSubmissionLimiter;
