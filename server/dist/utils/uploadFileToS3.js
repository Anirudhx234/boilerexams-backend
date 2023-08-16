var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b;
import { nanoid } from "nanoid";
import { APIError } from "../middleware/errors/index.js";
import { Upload } from "@aws-sdk/lib-storage";
import { S3 } from "@aws-sdk/client-s3";
const s3 = new S3({
    credentials: {
        accessKeyId: (_a = process.env.AWS_ACCESS_KEY_ID) !== null && _a !== void 0 ? _a : "",
        secretAccessKey: (_b = process.env.AWS_SECRET_ACCESS_KEY) !== null && _b !== void 0 ? _b : ""
    }
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
    yield new Upload({
        client: s3,
        params
    }).done();
    const data = {
        Location: `https://${params.Bucket}.s3.us-east-2.amazonaws.com/${params.Key}`,
        Key: params.Key
    };
    return data;
});
export default uploadFileToS3;
//# sourceMappingURL=uploadFileToS3.js.map