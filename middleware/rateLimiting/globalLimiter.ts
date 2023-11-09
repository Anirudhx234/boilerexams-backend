import { rateLimit } from 'express-rate-limit';
import { isWhitelisted } from "../auth/auth.js";

const globalLimiter = rateLimit({
	windowMs: 1000,
	max: 50,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
	skip: (req) => {
		return isWhitelisted(req);
	}
});

export default globalLimiter;