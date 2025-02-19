import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../prisma/prisma.js";
import APIError from "../middleware/errors/APIError.js";

export const CreateBannerOptions = z.object({
    message: z.string(),
    startDate: z.coerce.date().default(new Date()),
    endDate: z.coerce.date().optional(),
    active: z.boolean().default(true)
});

export const UpdateBannerOptions = CreateBannerOptions.partial();

export async function getActiveBanners(req: Request, res: Response) {
    const now = new Date();

    const banners = await prisma.banner.findMany({
        where: {
            active: true,
            startDate: {
                lte: now
            },
            endDate: {
                gte: now,
                not: null
            },
            OR: [
                { endDate: null }
            ]
        }
    });

    res.status(200).send(banners);
}

export async function createBanner(req: Request, res: Response) {
    const options = CreateBannerOptions.parse(req.body);

    if (options.endDate && options.startDate >= options.endDate) {
        throw new APIError("Start date must be before end date", 400);
    }

    const banner = await prisma.banner.create({
        data: options
    });

    res.status(200).send(banner);
}

export async function updateBanner(req: Request, res: Response) {
    const { bannerId } = req.params;
    const options = UpdateBannerOptions.parse(req.body);

    const banner = await prisma.banner.update({
        where: {
            id: bannerId
        },
        data: options
    });

    if (!banner) {
        throw new APIError("Banner not found", 404);
    }

    res.status(200).send(banner);
}

export async function deleteBanner(req: Request, res: Response) {
    const { bannerId } = req.params;

    const banner = await prisma.banner.delete({
        where: {
            id: bannerId
        }
    });

    if (!banner) {
        throw new APIError("Banner not found", 404);
    }

    res.status(200).send(banner);
} 