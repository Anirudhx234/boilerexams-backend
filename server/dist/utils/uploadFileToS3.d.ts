/// <reference types="node" />
declare const uploadFileToS3: (buffer: Buffer, contentType: string) => Promise<{
    Location: string;
    Key: string;
}>;
export default uploadFileToS3;
