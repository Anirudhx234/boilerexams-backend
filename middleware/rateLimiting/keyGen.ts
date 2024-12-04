import { randomUUID } from "node:crypto";
import { Request, Response } from "express";

export default function keyGen(req: Request, res: Response) {
    const clientId = req.cookies["ClientId"];

    if (!clientId) {
        const newId = randomUUID();
        res.cookie("ClientId", newId);
        return newId;
    }

    return clientId;
}