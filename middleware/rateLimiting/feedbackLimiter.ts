import { rateLimit } from "express-rate-limit";
import isWhitelisted from "../../helpers/auth/isWhiteListed.js";
import isAuthorized from "../auth/isAuthorized.js";
import { Role } from "@prisma/client";

const feedbackLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: (req) => {
        if (isWhitelisted(req)) {
            return true;
        }

        return isAuthorized(req.user, Role.CONTENT);
    },
});

export default feedbackLimiter;
