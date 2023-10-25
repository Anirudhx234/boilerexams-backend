import { NextFunction, Request, Response } from "express";
import NodeCache from 'node-cache';
const serverCache = new NodeCache();

const cache = (duration: number) => (req: Request, res, next: NextFunction) => {
    if (req.method !== 'GET') {
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
        res.sendResponse = res.send;
        res.send = body => {
            serverCache.set(key, body, duration);
            res.sendResponse(body);
        };
        next();
    }
};

export default cache;