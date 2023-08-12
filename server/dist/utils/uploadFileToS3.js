var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { nanoid } from "nanoid";
import { APIError } from "../middleware/errors/index.js";
import Aws from 'aws-sdk';
const s3 = new Aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
const uploadFileToS3 = (buffer, contentType) => __awaiter(void 0, void 0, void 0, function* () {
    if (!buffer) {
        throw new APIError("No file attached", 400);
    }
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME || "",
        Key: nanoid(),
        Body: buffer,
        ACL: "public-read-write",
        ContentType: contentType
    };
    const promise = s3.upload(params, (error) => {
        if (error) {
            throw new Error(error);
        }
    }).promise();
    const data = yield Promise.resolve(promise);
    if (!data) {
        throw new Error("File upload failed");
    }
    return data;
});
export default uploadFileToS3;
//# sourceMappingURL=uploadFileToS3.js.map