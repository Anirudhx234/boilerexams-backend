import { Role } from "@prisma/client";
import { rateLimit } from "express-rate-limit";
import isAuthorized from "../auth/isAuthorized.js";
import isWhitelisted from "../auth/isWhiteListed.js";
import keyGen from "./keyGen.js";

const feedbackLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: keyGen,
    skip: (req) => {
        if (isWhitelisted(req)) {
            return true;
        }

        return isAuthorized(req.user, Role.CONTENT);
    }
});

export default feedbackLimiter;
