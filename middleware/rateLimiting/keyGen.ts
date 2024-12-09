import { randomUUID } from "node:crypto";
import { Request, Response } from "express";
import NodeCache from "node-cache";

export const clientCache = new NodeCache({ stdTTL: 15 * 60, checkperiod: 60 });

export default function keyGen(req: Request, res: Response) {
    const clientId = req.cookies["ClientId"];

    if (!clientId) {
        const newId = randomUUID();
        clientCache.set(newId, true);
        res.cookie("ClientId", newId);
        return newId;
    }

    clientCache.set(clientId, true);
    return clientId;
}