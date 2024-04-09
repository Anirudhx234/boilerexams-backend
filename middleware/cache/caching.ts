import { NextFunction, Request, Response } from "express";
import NodeCache from "node-cache";

const serverCache = new NodeCache();

const cache = (duration: number) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.user != undefined) {
            return next();
        }

        if (req.method !== "GET") {
            if (serverCache.has(req.originalUrl)) {
                serverCache.del(req.originalUrl);
            }
            return next();
        }

        const key: string = req.originalUrl;
        const cachedBody = serverCache.get(key);

        if (cachedBody) {
            res.json(JSON.parse(cachedBody.toString()));
        } else {
            const originalSend = res.send;
            res.send = (body: unknown) => {
                serverCache.set(key, body, duration);
                return originalSend.call(res, body);
            };
            next();
        }
    };
};

export default cache;