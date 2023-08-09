import { PrismaClient, ResourceType, Language } from '@prisma/client'
import { Request, Response } from 'express'
import axios from 'axios';
import { APIError } from '../middleware/errors';
import uploadFileToS3 from '../utils/uploadFileToS3';
const prisma = new PrismaClient();

const getResource = async (req: Request, res: Response) => {
    const { resourceId } = req.params
    const resource = await prisma.resource.findUnique({
        where: {
            id: resourceId
        },
        include: {
            image: true,
            code: true
        }
    })
    res.status(200).send(resource)
}

const createImageResource = async (req: Request, res: Response) => {
    const { altText } = req.body

    if (!req.file) {
        throw new APIError("No file attached", 400);
    }

    const data = await uploadFileToS3(req.file.buffer, req.file.mimetype);

    const resource = await prisma.resource.create({
        data: {
            type: ResourceType.IMAGE,
            image: {
                create: {
                    key: data.Key,
                    url: data.Location,
                    altText: altText
                }
            }
        },
        include: {
            image: true
        }
    })
    res.status(200).send(resource)
}

const createImageResourceFromLink = async (req: Request, res: Response) => {
    const { link, altText } = req.body

    const image = await axios.get(link, {
        responseType: 'arraybuffer',
        maxContentLength: 500 * 1024
    })

    const contentType = image.headers['content-type']

    if (contentType !== "image/png" && contentType !== "image/jpeg") {
        throw new APIError("Image upload failed, link must be JPEG or PNG", 415)
    }

    const data = await uploadFileToS3(image.data, contentType);

    const resource = await prisma.resource.create({
        data: {
            type: ResourceType.IMAGE,
            image: {
                create: {
                    key: data.Key,
                    url: data.Location,
                    altText: altText
                }
            }
        },
        include: {
            image: true
        }
    })
    res.status(200).send(resource)
}

const createCodeResource = async (req: Request, res: Response) => {
    const { language, code } = req.body
    const resource = await prisma.resource.create({
        data: {
            type: ResourceType.CODE,
            code: {
                create: {
                    language: Language[language.toUpperCase() as keyof typeof Language],
                    code: code
                }
            }
        },
        include: {
            code: true
        }
    })
    res.status(200).send(resource)
}

const updateCodeResource = async (req: Request, res: Response) => {
    const { resourceId } = req.params
    const { language, code } = req.body
    const resource = await prisma.resource.update({
        where: {
            id: resourceId
        },
        data: {
            code: {
                update: {
                    language: Language[language.toUpperCase() as keyof typeof Language],
                    code: code
                }
            }
        },
        include: {
            code: true
        }
    })
    res.status(200).send(resource)
}

const deleteResource = async (req: Request, res: Response) => {
    const { resourceId } = req.params;
    const resource = await prisma.resource.delete({
        where: {
            id: resourceId
        }
    })
    res.status(200).send(resource)
}

export {
    getResource,
    createImageResource,
    createImageResourceFromLink,
    createCodeResource,
    updateCodeResource,
    deleteResource
}