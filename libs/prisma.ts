import { PrismaClient, ResourceType } from "@prisma/client";
import FlagDecoder from "../helpers/decoder.js";
import uploadFileToS3 from "../utils/uploadFileToS3.js";
import { UrlResourceData } from "../prisma/schema.js";

function prismaClientSingleton() {
    return new PrismaClient().$extends({
        query: {
            resource: {
                // Hook into resource create query
                async create({ query, args}) {
                    if (args.data.type == ResourceType.QUESTION_IMAGE) {
                        // ToDo Test if this works

                        const file = args.data.data as any;
                        const { Location, Key} = await uploadFileToS3(file.buffer, file.mimetype);
                        args.data.data = {
                            url: Location,
                            key: Key
                        };
                        args.data.type = ResourceType.QUESTION_IMAGE;
                    }

                    return query(args);
                },
                // Hook into resource delete query
                async delete({ query, args }) {
                    const resource = await query(args);

                    if (resource.type == ResourceType.QUESTION_IMAGE) {
                        const result = UrlResourceData.safeParse(resource.data);

                        if (result.success) {
                            if (result.data.key) {
                                // ToDo Delete file from S3
                            }
                        }
                    }

                    return resource;
                }
            }
        },
        result: { // Extension of result allows us to modify result of a fetch query
            course: { // Modify course result
                flags: {
                    needs: { flags : true },
                    compute(course) {
                        return FlagDecoder.course(course.flags); // Overwrite flag field with computed flags
                    }
                }
            },
            exam: { // Modify exam query
                flags: {
                    needs: { flags : true },
                    compute(exam) {
                        return FlagDecoder.exam(exam.flags); // Overwrite flag field with computed flags
                    }
                }
            },
            question: { // Modify question query
                flags: {
                    needs: { flags: true },
                    compute(question) {
                        return FlagDecoder.question(question.flags); // Overwrite flag field with computed flags
                    }
                }
            },
        }
    });
}

declare global {
    // eslint-disable-next-line no-var
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;