import { PrismaClient, ResourceType } from '@prisma/client'
import { nanoid } from 'nanoid';

const prisma = new PrismaClient()
var Aws = require('aws-sdk');

const s3 = new Aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const savePDFtoExam = async (examId: string, id: string, buffer) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: nanoid(),
        Body: buffer,
        ACL: "public-read-write",
        ContentType: "application/pdf"
    };

    const promise = s3.upload(params, (error) => {
        if (error) {
            throw new Error(error);
        }
    }).promise()

    const data = await Promise.resolve(promise)
    if (!data) {
        throw new Error("PDF upload failed")
    }

    await prisma.exam.update({
        where: {
            id: examId
        },
        data: {
            pdfId: id,
            pdfKey: data.Key,
            pdfLink: data.Location
        }
    })
}

export default savePDFtoExam