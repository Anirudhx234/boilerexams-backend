const { PrismaClient, ResourceType, Language } = require('@prisma/client')
const prisma = new PrismaClient();

const multer = require('multer');
const Aws = require('aws-sdk');

const express = require('express');
const app = express();

const asyncWrapper = require("../middleware/wrappers/asyncWrapper")

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(new multer.MulterError('File type must be JPEG or PNG'))
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 500 * 1024
    }
});

const s3 = new Aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

app.get("/resources/:resourceId", async (req, res) => {
    try {
        const { resourceId } = req.params
        prisma.resource.findUnique({
            where: {
                id: resourceId
            },
            include: {
                image: true,
                code: true
            }
        })
            .then((resp) => res.status(200).send(resp))
            .catch((err) => res.status(400).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
})

app.post("/resources/images", upload.single('image'), async (req, res, next) => {
    try {
        if (!req.image) {
            throw new Error("No file attached")
        }

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: req.image.originalname,
            Body: req.image.buffer,
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

        prisma.resource.create({
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
            .then((resp) => res.status(200).send(resp))
            .catch((err) => res.status(400).send(err))
    } catch (error) {
        next(error)
    }
})

app.post("/resources/codes", asyncWrapper(async (req, res) => {
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
}))

app.put("/resources/:resourceId/code", asyncWrapper(async (req, res) => {
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
}))

app.delete("/resources/:resourceId", asyncWrapper(async (req, res) => {
    const { resourceId } = req.params;
    const resource = await prisma.resource.delete({
        where: {
            id: resourceId
        }
    })
    res.status(200).send(resource)
}))

module.exports = app
export { }