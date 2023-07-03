const { PrismaClient } = require('@prisma/client')
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

app.post("/resources", upload.array('files'), async (req, res) => {
    try {
        const imageData : {key: string, url: string}[] = []
        const promises: Promise<any>[] = []

        if (req.files) {
            req.files.forEach((file) => {
                const params = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: file.originalname,
                    Body: file.buffer,
                    ACL: "public-read-write",
                };

                promises.push(s3.upload(params, (error, data) => {
                    if (error) {
                        throw new Error(error);
                    }
                }).promise())
            })
        }

        const data = await Promise.all(promises)
        if (!data) {
            return res.status(400).send("Image(s) upload failed")
        }
        data.forEach((image) => imageData.push({key: image.Key, url: image.Location}))

        prisma.resource.create({
            data: {
                imageData: imageData,
                code: req.body.code
            }
        })
            .then((resp) => res.status(200).send(resp))
            .catch((err) => res.status(400).send(err))
    } catch (e) {
        console.log(e);
    }
})

const deleteResource = async (resourceId) => {
    try {
        const resource = await prisma.resource.findUnique({
            where: {
                id: resourceId
            }
        })

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: ""
        }

        const data = s3.deleteObject(params, (error, data) => {
            if (error) {
                throw new Error(error);
            }
            return data;
        })
    } catch (e) {
        console.log(e);
    }
}

exports.deleteResource = deleteResource;
module.exports = app
export { }