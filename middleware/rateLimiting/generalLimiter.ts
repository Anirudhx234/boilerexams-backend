import { rateLimit } from 'express-rate-limit';

const generalLimiter = rateLimit({
	windowMs: 1000,
	max: 10,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
});

export default generalLimiter;