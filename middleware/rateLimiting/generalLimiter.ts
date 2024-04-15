import { rateLimit } from "express-rate-limit";
import isWhitelisted from "../auth/isWhiteListed.js";

const generalLimiter = rateLimit({
    windowMs: 1000,
    max: 16, // 2 << 4
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: (req) => {
        return isWhitelisted(req);
    },
});

export default generalLimiter;
