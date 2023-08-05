import { PrismaClient, ResourceType, Language } from '@prisma/client'
import { Request, Response } from 'express'
import { nanoid } from 'nanoid'
import axios from 'axios';
import { APIError } from '../middleware/errors';
const prisma = new PrismaClient();

var Aws = require('aws-sdk');

const s3 = new Aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

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
        throw new Error("No file attached")
    }

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: nanoid(),
        Body: req.file.buffer,
        ACL: "public-read-write",
    };

    const promise = s3.upload(params, (error) => {
        if (error) {
            throw new Error(error);
        }
    }).promise()

    const data = await Promise.resolve(promise)
    if (!data) {
        throw new Error("Image upload failed")
    }

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

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: nanoid(),
        Body: image.data,
        ACL: "public-read-write",
        ContentType: contentType
    };

    const promise = s3.upload(params, (error) => {
        if (error) {
            throw new Error(error);
        }
    }).promise()

    const data = await Promise.resolve(promise)
    if (!data) {
        throw new Error("Image upload failed")
    }

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