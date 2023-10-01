import { rateLimit } from 'express-rate-limit';

const globalLimiter = rateLimit({
	windowMs: 1000,
	max: 50,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
});

export default globalLimiter;