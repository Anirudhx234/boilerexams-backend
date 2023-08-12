import { Request, Response, NextFunction } from "express"
import NodeCache from 'node-cache';
const serverCache = new NodeCache();

module.exports = duration => (req: Request, res, next: NextFunction) => {
    if (req.method !== 'GET') {
        if (serverCache.has(req.originalUrl)) {
            serverCache.del(req.originalUrl);
        }
        return next();
    }
    const key = req.originalUrl;
    const cachedBody = serverCache.get(key);
    if (cachedBody) {
        try {
            // @ts-ignore
            res.json(JSON.parse(cachedBody));
        }
        catch { }
    } else {
        res.sendResponse = res.send;
        res.send = body => {
            serverCache.set(key, body, duration);
            res.sendResponse(body);
        };
        next();
    }
};