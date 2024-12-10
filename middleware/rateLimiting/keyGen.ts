import { randomUUID } from "node:crypto";
import { Request, Response } from "express";
import NodeCache from "node-cache";

export const dailyCache = new NodeCache({ checkperiod: 60 });
export const activeCache = new NodeCache({ stdTTL: 15 * 60, checkperiod: 60 });

export default function keyGen(req: Request, res: Response) {
    let clientId = req.cookies["ClientId"];

    if (!clientId) {
        clientId = randomUUID();
        res.cookie("ClientId", clientId);
    }

    dailyCache.set(clientId, true, secondsToMidnight());
    activeCache.set(clientId, true);
    return clientId;
}

function secondsToMidnight() {
    const now = new Date();
    const night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // the next day, ...
        0, 0, 0 // ...at 00:00:00 hours
    );

    const msToMidnight = night.getTime() - now.getTime();
    const offset = 1000 * 60 * 60 * 5; // 5-hour difference between EST and UTC
    const boundary = 1000 * 60 * 60 * 24; // Milliseconds in a day
    const modulated = (msToMidnight + offset) % boundary;
    return Math.floor(modulated / 1000);
}