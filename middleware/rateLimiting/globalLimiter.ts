import { rateLimit } from "express-rate-limit";
import isWhitelisted from "../../helpers/auth/isWhiteListed.js";

const globalLimiter = rateLimit({
    windowMs: 1000,
    max: 2048, // 2 << 11
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: (req) => {
        return isWhitelisted(req);
    },
});

export default globalLimiter;
