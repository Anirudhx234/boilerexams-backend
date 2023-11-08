import { rateLimit } from 'express-rate-limit';

const generalLimiter = rateLimit({
	windowMs: 1000,
	max: 10,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
	skip: (req) => {
		if (!process.env.FEEDBACK_API_KEY) return false;
		return req.headers.authorization == process.env.FEEDBACK_API_KEY;
	}
});

export default generalLimiter;