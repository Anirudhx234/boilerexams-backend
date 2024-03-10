import { PrismaClient } from "@prisma/client";
import FlagDecoder from "../helpers/decoder.js";

function prismaClientSingleton() {
    return new PrismaClient().$extends({
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