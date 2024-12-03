import { rateLimit } from "express-rate-limit";
import isWhitelisted from "../auth/isWhiteListed.js";
import keyGen from "./keyGen.js";

const submissionLimiter = rateLimit({
    windowMs: 1000,
    max: 1,
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

export default submissionLimiter;
