import { PrismaClient } from "@prisma/client";
import FlagDecoder from "../helpers/decoder.js";

const prisma = new PrismaClient();

export default prisma.$extends({
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
        }
    }
});

if (process.env.NODE_ENV != "production") {
    if (!global.prisma) {
        global.prisma = prisma;
    }
}