import { Request } from "express";

const isWhitelisted = (req: Request) => {
    if (!process.env.FEEDBACK_API_KEY) {
        return false;
    }
    return req.headers.authorization === process.env.FEEDBACK_API_KEY;
};

export default isWhitelisted;
