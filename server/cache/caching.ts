const NodeCache = require('node-cache');
const serverCache = new NodeCache();

module.exports = duration => (req, res, next) => {
    // Deletes cache at equivalent get route
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
            res.json(JSON.parse(cachedBody));
        }
        catch {}
    } else {
        res.sendResponse = res.send;
        res.send = body => {
            serverCache.set(key, body, duration);
            res.sendResponse(body);
        };
        next();
    }
};