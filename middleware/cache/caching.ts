import { NextFunction, Request, Response } from "express";
import NodeCache from "node-cache";
const serverCache = new NodeCache();

const cache = (duration: number) => (req: Request, res: Response, next: NextFunction) => {
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
        // @ts-ignore
        res.sendResponse = res.send;
        // @ts-ignore
        res.send = (body: any) => {
            serverCache.set(key, body, duration);
            // @ts-ignore
            res.sendResponse(body);
        };
        next();
    }
};

export default cache;
