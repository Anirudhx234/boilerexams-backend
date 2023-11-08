import { rateLimit } from 'express-rate-limit';

const globalLimiter = rateLimit({
	windowMs: 1000,
	max: 50,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
	skip: (req) => {
		if (!process.env.FEEDBACK_API_KEY) return false;
		return req.headers.authorization == process.env.FEEDBACK_API_KEY;
	}
});

export default globalLimiter;