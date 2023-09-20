import { rateLimit } from 'express-rate-limit';
import allowListCheck from './allowListCheck.js';

const webhookLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 5,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
	skip: (req, res) => allowListCheck(req.ip),
})

export default webhookLimiter