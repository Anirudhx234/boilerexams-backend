import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../prisma/prisma.js";

export const UpdatePrivacyBody = z.object({
    anonymous: z.boolean()
})

export async function getPrivacy(req: Request, res: Response) {
    const anonymous = req.anonymous;

    res.status(200).send({
        status: anonymous
    });
}

export async function updatePrivacy(req: Request, res: Response) {
    const data = UpdatePrivacyBody.parse(req.body);
    const clientId = req.clientId;

    await prisma.clientId.update({
        where: {
            id: clientId,
        },
        data: {
            anonymous: data.anonymous,
        }
    });

    res.status(200).send({
        status: data.anonymous
    });
}