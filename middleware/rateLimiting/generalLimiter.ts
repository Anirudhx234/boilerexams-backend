import { rateLimit } from 'express-rate-limit';
import {isWhitelisted} from "../auth/auth";

const generalLimiter = rateLimit({
	windowMs: 1000,
	max: 10,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
	skip: (req) => {
		return isWhitelisted(req);
	}
});

export default generalLimiter;