import { rateLimit } from 'express-rate-limit';
import allowListCheck from './allowListCheck.js';

const globalLimiter = rateLimit({
	windowMs: 1000,
	max: 50,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
    skip: (req, res) => allowListCheck(req.ip),
})

export default globalLimiter