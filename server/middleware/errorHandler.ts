import { Prisma } from '@prisma/client';
import {APIError, InvalidCourseError, InvalidSeasonError, NotFoundError} from "./errors/index";
import multer from 'multer';

const errorHandler = (error, req, res, next) => {
    if (error instanceof NotFoundError) {
        return res.status(error.errorCode).json({message: error.message})
    }

    if (error instanceof InvalidSeasonError) {
        return res.status(error.errorCode).json({message: error.message})
    }

    if (error instanceof InvalidCourseError) {
        return res.status(error.errorCode).json({message: error.message})
    }

    if (error instanceof multer.MulterError && error.code == "LIMIT_FILE_SIZE") {
        if (error.field == "image") {
            return res.status(413).json({message: "Image size must be under 500 KB"})
        }
        else if (error.field == "pdf") {
            return res.status(413).json({message: "PDF size must be under 5 MB"})
        }
    }

    if (error instanceof multer.MulterError) {
        return res.status(415).json({message: error.code})
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return res.status(400).json({message: error.meta?.cause})
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({message: error.message})
    }

    if (error instanceof APIError) {
        return res.status(error.errorCode).status({message: error.message})
    }

    return res.status(400).json({message: error.message})
}

export default errorHandler