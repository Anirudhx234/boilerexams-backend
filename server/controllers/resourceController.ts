import { PrismaClient, ResourceType, Language } from '@prisma/client'
const prisma = new PrismaClient();

const Aws = require('aws-sdk');

const s3 = new Aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const getResource = async (req, res) => {
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

const createImageResource = async (req, res, next) => {
    if (!req.file) {
        throw new Error("No file attached")
    }

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: req.file.originalname,
        Body: req.file.buffer,
        ACL: "public-read-write",
    };

    const promise = s3.upload(params, (error, data) => {
        if (error) {
            throw new Error(error);
        }
    }).promise()

    const data = await Promise.resolve(promise)
    if (!data) {
        return res.status(400).send("Image(s) upload failed")
    }

    const resource = await prisma.resource.create({
        data: {
            type: ResourceType.IMAGE,
            image: {
                create: {
                    key: data.Key,
                    url: data.Location,
                    altText: req.body.altText
                }
            }
        },
        include: {
            image: true
        }
    })
    res.status(200).send(resource)
}

const createCodeResource = async (req, res) => {
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

const updateCodeResource = async (req, res) => {
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

const deleteResource = async (req, res) => {
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
    createCodeResource,
    updateCodeResource,
    deleteResource
}