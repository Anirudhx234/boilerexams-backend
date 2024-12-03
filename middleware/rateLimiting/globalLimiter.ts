import { rateLimit } from "express-rate-limit";
import isWhitelisted from "../auth/isWhiteListed.js";
import { response } from "express";
import { randomUUID } from "node:crypto";
import keyGen from "./keyGen.js";

const globalLimiter = rateLimit({
    windowMs: 1000,
    max: 2048, // 2 << 11
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: keyGen,
    skip: (req) => {
        return isWhitelisted(req);
    }
});

export default globalLimiter;
