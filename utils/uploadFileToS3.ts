import { nanoid } from "nanoid";
import { APIError } from "../middleware/errors/index.js";
import { Upload } from "@aws-sdk/lib-storage";
import { S3 } from "@aws-sdk/client-s3";

function s3Client() {
    const config = {
        credentials: {
            accessKeyId: process.env["AWS_ACCESS_KEY_ID"] ?? "",
            secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"] ?? "",
        },
        region: "us-east-2",
    };

    return new S3(config);
}

export async function uploadFileToS3(buffer: Buffer, contentType: string) {
    if (!buffer) {
        throw new APIError("No file attached", 400);
    }

    const s3 = s3Client();

    const params = {
        Bucket: process.env["AWS_BUCKET_NAME"] ?? "",
        Key: nanoid(),
        Body: buffer,
        ACL: "public-read-write",
        ContentType: contentType,
    };

    await new Upload({
        client: s3,
        params,
    }).done();

    return {
        Location: `https://${params.Bucket}.s3.us-east-2.amazonaws.com/${params.Key}`,
        Key: params.Key,
    };
}

export async function deleteFileFromS3(key: string) {
    const s3 = s3Client();

    const params = {
        Bucket: process.env["AWS_BUCKET_NAME"] ?? "",
        Key: key,
    };

    await s3.deleteObject(params);
}

export default uploadFileToS3;
