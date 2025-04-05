import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../prisma/prisma.js";

export const UpdatePrivacyBody = z.object({
    anonymous: z.boolean()
})

// IOS ONLY
export async function validateClientId(req: Request, res: Response) {
    const options = z.object({
        uuid: z.string().uuid(),
        anonymous: z.boolean().default(false)
    }).parse(req.body);

    await prisma.clientId.upsert({ // Create the ClientId entry
        where: {
            id: options.uuid,
        },
        update: {
            anonymous: options.anonymous
        },
        create: {
            id: options.uuid,
            anonymous: options.anonymous
        }
    })

    res.sendStatus(200)
}

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