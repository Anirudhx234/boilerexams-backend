import { randomUUID } from "node:crypto";
import { Request, Response } from "express";
import NodeCache from "node-cache";
import prisma from "../../prisma/prisma.js";
import { DiscordAPI } from "../../services/discord.api.js";

export const dailyCache = new NodeCache({ checkperiod: 60 });
export const activeCache = new NodeCache({ stdTTL: 15 * 60, checkperiod: 60 });

const day = 1000 * 60 * 60 * 24;

export default async function keyGen(req: Request, res: Response) {
    let clientId = req.cookies["ClientId"];

    if (!clientId) {
        clientId = randomUUID();
        await prisma.clientId.create({
            data: {
                id: clientId
            }
        })
        res.cookie("ClientId", clientId, { maxAge: 400 * day });
    } else {
        const client = await prisma.clientId.findUnique({
            where: {
                id: clientId
            }
        })

        DiscordAPI.reportError(new Error("Unregistered UUID"), clientId).catch((_) => {})

        if (!client) {
            clientId = randomUUID();
            await prisma.clientId.create({
                data: {
                    id: clientId
                }
            })
            res.cookie("ClientId", clientId, { maxAge: 400 * day });
        }
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