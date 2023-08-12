/// <reference types="node" />
import Aws from 'aws-sdk';
declare const uploadFileToS3: (buffer: Buffer, contentType: string) => Promise<Aws.S3.ManagedUpload.SendData>;
export default uploadFileToS3;
