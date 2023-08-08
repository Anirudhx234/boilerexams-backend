import { nanoid } from "nanoid";
import { APIError } from "../middleware/errors";

var Aws = require('aws-sdk');

const s3 = new Aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const uploadFileToS3 = async (buffer: Buffer, contentType: string) => {
    if (!buffer) {
        throw new APIError("No file attached", 400);
    }

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: nanoid(),
        Body: buffer,
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
        throw new Error("File upload failed")
    }
    return data
}

export default uploadFileToS3