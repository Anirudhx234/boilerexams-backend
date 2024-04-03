import { Request, Response } from "express";
import prisma from "../prisma/prisma.js";

/*
const getResource = async (req: Request, res: Response) => {
    const { resourceId } = req.params;

    const resource = await prisma.resource.findUnique({
        where: {
            id: resourceId,
        }
    });

    res.status(200).send(resource);
};

const createFileResource = async (req: Request, res: Response) => {
    if (!req.file) {
        throw new APIError("No file attached", 400);
    }

    const data = await uploadFileToS3(req.file.buffer, req.file.mimetype);
    const options = FileResourceScheme.parse(req.body);

    const resource = await prisma.resource.create({
        data: {
            ...options,
        },
        include: {
            image: true,
        },
    });

    res.status(200).send(resource);
};

const createImageResourceFromLink = async (req: Request, res: Response) => {
    const { link, altText } = req.body;

    const image = await axios.get(link, {
        responseType: "arraybuffer",
        maxContentLength: 1000 * 1024,
    });

    const contentType = image.headers["content-type"];

    if (contentType !== "image/png" && contentType !== "image/jpeg") {
        throw new APIError("Image upload failed, link must be JPEG or PNG", 415);
    }

    const data = await uploadFileToS3(image.data, contentType);

    const resource = await prisma.resource.create({
        data: {
            type: ResourceType.IMAGE,
            image: {
                create: {
                    key: data.Key,
                    url: data.Location,
                    altText: altText,
                },
            },
        },
        include: {
            image: true,
        },
    });
    res.status(200).send(resource);
};

const createCodeResource = async (req: Request, res: Response) => {
    const { language, content } = req.body;
    const resource = await prisma.resource.create({
        data: {
            type: ResourceType.CODE,
            code: {
                create: {
                    language: Language[language.toUpperCase() as keyof typeof Language],
                    content: content,
                },
            },
        },
        include: {
            code: true,
        },
    });
    res.status(200).send(resource);
};

const updateImageResource = async (req: Request, res: Response) => {
    const { resourceId } = req.params;
    const { altText } = req.body;

    const resource = await prisma.resource.update({
        where: {
            id: resourceId,
        },
        data: {
            image: {
                update: {
                    altText: altText,
                },
            },
        },
        include: {
            image: true,
        },
    });
    res.status(200).send(resource);
};

const updateCodeResource = async (req: Request, res: Response) => {
    const { resourceId } = req.params;
    const { language, content } = req.body;

    const resource = await prisma.resource.update({
        where: {
            id: resourceId,
        },
        data: {
            code: {
                update: {
                    language: Language[language.toUpperCase() as keyof typeof Language],
                    content: content,
                },
            },
        },
        include: {
            code: true,
        },
    });
    res.status(200).send(resource);
};

const deleteResource = async (req: Request, res: Response) => {
    const { resourceId } = req.params;
    const resource = await prisma.resource.delete({
        where: {
            id: resourceId,
        },
    });
    res.status(200).send(resource);
};

export {
    getResource,
    createImageResource,
    createImageResourceFromLink,
    createCodeResource,
    updateImageResource,
    updateCodeResource,
    deleteResource,
};
 */