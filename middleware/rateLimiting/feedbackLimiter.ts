import { rateLimit } from 'express-rate-limit';

const allowList = ["178.128.158.20", "73.103.19.222", "::1"]

const feedbackLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req, res) => allowList.includes(req.ip),
})

export default feedbackLimiter