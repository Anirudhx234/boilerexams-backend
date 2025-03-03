import { Request, Response } from "express";
import prisma from "../prisma/prisma.js";

export async function getPrivacy(req: Request, res: Response) {
    const anonymous = req.anonymous;

    res.status(200).send({
        status: anonymous
    });
}

export async function togglePrivacy(req: Request, res: Response) {
    const anonymous = req.anonymous;
    const clientId = req.clientId;

    await prisma.clientId.update({
        where: {
            id: clientId,
        },
        data: {
            anonymous: !anonymous,
        }
    });

    res.status(200).send({
        status: !anonymous
    });
}