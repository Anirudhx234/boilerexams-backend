import { rateLimit } from 'express-rate-limit';
const allowList = ["178.128.158.20", "73.103.19.222"];
const generalLimiter = rateLimit({
    windowMs: 1000,
    max: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req, res) => allowList.includes(req.ip),
});
export default generalLimiter;
//# sourceMappingURL=generalLimiter.js.map