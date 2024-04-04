import { z } from "zod";
import { ResourceType } from "@prisma/client";
import { Request, Response } from "express";
import prisma from "../prisma/prisma.js";
import uploadFileToS3 from "../utils/uploadFileToS3.js";
import axios from "axios";
import { APIError } from "../middleware/errors/index.js";

export const CodeResourceData = z.object({
    language:   z.enum([ "C", "JAVA", "PYTHON", "TEXT" ]),
    content:    z.string(),
    index:      z.number().optional()
});

export const UrlResourceData = z.object({
    url:        z.string().url(),
    key:        z.string().optional(),
    altText:    z.string().optional()
});

export const UpsertResource = z.object({
    id:             z.string().uuid().optional(),
    courseId:       z.string().uuid().optional(),
    examId:         z.string().uuid().optional(),
    questionId:     z.string().uuid().optional(),
    explanationId:  z.string().uuid().optional(),
    answerChoiceId: z.string().uuid().optional(),
    type:           z.nativeEnum(ResourceType),
    data:           z.union([CodeResourceData, UrlResourceData])
});

const fileBasedResources: ResourceType[] = [ ResourceType.LOGO, ResourceType.IMAGE, ResourceType.PDF ];

export async function getResource(req: Request, res: Response) {
    const { resourceId } = req.params;

    const resource = await prisma.resource.findUnique({
        where: {
            id: resourceId,
        }
    });

    res.status(200).send(resource);
}

export async function upsertResource(req: Request, res: Response) {
    const options = UpsertResource.parse(req.body);

    if (fileBasedResources.includes(options.type)) {
        if (req.file) {
            const s3Data = await uploadFileToS3(req.file.buffer, req.file.mimetype);
            const data = UrlResourceData.parse(options.data);
            data.key = s3Data.Key;
            data.url = s3Data.Location;
            options.data = data;
        } else {
            const data = UrlResourceData.parse(options.data);
            const image = await axios.get(data.url, {
                responseType: "arraybuffer",
                maxContentLength: 1000 * 1024,
            });

            const contentType = image.headers["content-type"];

            if (contentType !== "image/png" && contentType !== "image/jpeg") {
                throw new APIError("Image upload failed, link must be JPEG or PNG", 415);
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
            id: resourceId,
        },
    });

    res.status(200).send(resource);
};