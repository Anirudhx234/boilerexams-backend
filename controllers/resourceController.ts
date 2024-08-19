import { Request, Response } from "express";
import { ResourceType } from "@prisma/client";
import axios from "axios";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import prisma from "../prisma/prisma.js";
import APIError from "../middleware/errors/APIError.js";
import uploadFileToS3 from "../utils/uploadFileToS3.js";

export const CodeResourceData = z.object({
    language: z.enum(["C", "JAVA", "PYTHON", "TEXT"]),
    content: z.string()
});

export const UrlResourceData = z.object({
    url: z.string().url(),
    key: z.string().optional(),
    mathpixId: z.string().optional(),
    altText: z.string().optional()
});

export const UpsertResourceOptions = z.object({
    id: z.string().uuid().default(randomUUID),
    courseId: z.string().uuid().nullable().optional(),
    examId: z.string().uuid().nullable().optional(),
    questionId: z.string().uuid().nullable().optional(),
    explanationId: z.string().uuid().nullable().optional(),
    answerChoiceId: z.string().uuid().nullable().optional(),
    applicationId: z.string().uuid().nullable().optional(),
    type: z.nativeEnum(ResourceType),
    data: z.union([CodeResourceData, UrlResourceData])
});

const fileBasedResources: ResourceType[] = [ResourceType.LOGO, ResourceType.IMAGE, ResourceType.PDF];

export async function uploadFile(req: Request, res: Response) {
    const file = req.file;

    if (!file) {
        throw new APIError("File missing from request", 400);
    }

    const data = await uploadFileToS3(file.buffer, file.mimetype);

    res.status(200).send({ url: data.Location, key: data.Key });
}

export async function getResource(req: Request, res: Response) {
    const { resourceId } = req.params;

    const resource = await prisma.resource.findUnique({
        where: {
            id: resourceId
        }
    });

    res.status(200).send(resource);
}

export async function upsertResource(req: Request, res: Response) {
    const options = UpsertResourceOptions.parse(req.body);

    if (fileBasedResources.includes(options.type)) {
        const kilobyte = 1000;
        const megabyte = kilobyte * kilobyte;
        const validFileTypes = ["image/jpeg", "image/png", "application/pdf"];

        const data = UrlResourceData.parse(options.data);

        if (!data.key) {
            const image = await axios.get(data.url, {
                responseType: "arraybuffer",
                maxContentLength: 15 * megabyte
            });

            const contentType = image.headers["content-type"];

            if (!validFileTypes.includes(contentType)) {
                throw new APIError("Image upload failed, link must be JPEG or PNG or PDF", 415);
            }

            const s3Data = await uploadFileToS3(image.data, contentType);
            data.key = s3Data.Key;
            data.url = s3Data.Location;
            options.data = data;
        }
    }

    const resource = await prisma.resource.upsert({
        where: {
            id: options.id
        },
        create: {
            ...options
        },
        update: {
            ...options
        }
    });

    res.status(200).send(resource);
}

export async function deleteResource(req: Request, res: Response) {
    const { resourceId } = req.params;

    const resource = await prisma.resource.delete({
        where: {
            id: resourceId
        }
    });

    res.status(200).send(resource);
}

export function connectOrCreateResources(resources?: z.infer<typeof UpsertResourceOptions>[]) {
    return {
        connectOrCreate: resources?.map((resource) => {
            return {
                where: {
                    id: resource.id
                },
                create: {
                    type: resource.type,
                    data: resource.data
                }
            };
        })
    };
}

export function upsertResources(resources?: z.infer<typeof UpsertResourceOptions>[]) {
    return {
        upsert: resources?.map((resource) => {
            return {
                where: {
                    id: resource.id
                },
                create: {
                    type: resource.type,
                    data: resource.data
                },
                update: {
                    type: resource.type,
                    data: resource.data
                }
            };
        })
    };
}
