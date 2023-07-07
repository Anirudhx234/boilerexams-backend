const { PrismaClient, ResourceType, Language } = require('@prisma/client')
const prisma = new PrismaClient();

const multer = require('multer');
const Aws = require('aws-sdk');

const express = require('express');
const app = express();

const storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        cb(null, '')
    }
})
const upload = multer({ storage: storage });

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

app.post("/resources/images", upload.single('file'), async (req, res) => {
    try {
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
    } catch (e) {
        res.status(400).send(e)
    }
})

app.post("/resources/codes", async (req, res) => {
    try {
        const { language, code } = req.body
        prisma.resource.create({
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
            .then((resp) => res.status(200).send(resp))
            .catch((err) => res.status(400).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
})

app.put("/resources/:resourceId/code", async (req, res) => {
    try {
        const { resourceId } = req.params
        const { language, code } = req.body
        prisma.resource.update({
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
            .then((resp) => res.status(200).send(resp))
            .catch((err) => res.status(400).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
})

app.delete("/resources/:resourceId", async (req, res) => {
    try {
        const { resourceId } = req.params;
        prisma.resource.delete({
            where: {
                id: resourceId
            }
        })
            .then((resp) => res.status(200).send(resp))
            .catch((err) => res.status(400).send(err))
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = app
export { }