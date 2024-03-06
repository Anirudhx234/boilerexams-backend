import { PrismaClient } from "@prisma/client";
import { FileResourceData } from "../prisma/schema.js";
import { deleteFileFromS3 } from "../utils/uploadFileToS3.js";

let prisma: PrismaClient;

// ToDo Hook function for deleting image resources from S3
async function onResourceDelete(args: unknown ) {
    const resource = await prisma.resource.findUnique({
        // @ts-expect-error Need to type args
        where: args.where
    });

    if (!resource) return;

    const result = FileResourceData.safeParse(resource.data);

    if (!result.success) return;
    if (!result.data.key) return;

    await deleteFileFromS3(result.data.key);
}

if (process.env.NODE_ENV === "production") {
    prisma = new PrismaClient();
        /*.$extends({ // ToDo hook into Resource Delete
        query: {
            resource: {
                async delete({ args, query }) {
                    await onResourceDelete(args);
                    return query(args);
                }
            }
        }
    });
         */
} else {
    if (!global.prisma) {
        global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
}

export default prisma;
