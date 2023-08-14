import { Prisma } from '@prisma/client';
import { APIError, InvalidCourseError, InvalidSeasonError, NotFoundError } from "./errors/index.js";
import multer from 'multer';
const errorHandler = (error, req, res, next) => {
    var _a, _b;
    if (error instanceof NotFoundError) {
        return res.status(error.errorCode).json({ message: error.message });
    }
    if (error instanceof InvalidSeasonError) {
        return res.status(error.errorCode).json({ message: error.message });
    }
    if (error instanceof InvalidCourseError) {
        return res.status(error.errorCode).json({ message: error.message });
    }
    if (error instanceof multer.MulterError && error.code == "LIMIT_FILE_SIZE") {
        if (error.field === "image") {
            return res.status(413).json({ message: "Image size must be under 1 MB" });
        }
        else if (error.field === "pdf") {
            return res.status(413).json({ message: "PDF size must be under 5 MB" });
        }
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if ((_a = error.meta) === null || _a === void 0 ? void 0 : _a.cause) {
            return res.status(400).json({ message: (_b = error.meta) === null || _b === void 0 ? void 0 : _b.cause });
        }
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({ message: error.message });
    }
    if (error instanceof APIError) {
        return res.status(error.errorCode).json({ message: error.message });
    }
    return res.status(400).json({ message: error.message });
};
export default errorHandler;
//# sourceMappingURL=errorHandler.js.map