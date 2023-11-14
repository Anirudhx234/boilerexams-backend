import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from "express";
import { APIError, InvalidCourseError, InvalidSeasonError, NotFoundError } from "./errors/index.js";
import multer from 'multer';
import { ErrorResponse } from '../types/errors/index.js';

const errorHandler = (error, req: Request, res: Response, next: NextFunction) => {
    let fullError = {};
    if (req.user) {
        if (["ADMIN", "CONTENT"].includes(req.user.role)) {
            fullError = error;
        }
    }

    if (!error.message) {
        error.message = "";
    }
    const errorResponse: ErrorResponse = {message: error.message, fullError: fullError};

    if (error instanceof NotFoundError) {
        return res.status(error.errorCode).json(errorResponse);
    }

    if (error instanceof InvalidSeasonError) {
        return res.status(error.errorCode).json(errorResponse);
    }

    if (error instanceof InvalidCourseError) {
        return res.status(error.errorCode).json(errorResponse);
    }

    if (error instanceof multer.MulterError && error.code == "LIMIT_FILE_SIZE") {
        if (error.field === "image") {
            errorResponse.message = "Image size must be under 1 MB";
        }
        else if (error.field === "pdf") {
            errorResponse.message = "PDF size must be under 5 MB";
        }
        return res.status(413).json(errorResponse);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        errorResponse.fullError = error;

        if (error.code === "P2002") {
            errorResponse.message = "Duplicate record exists. Record not created.";
            return res.status(409).json(errorResponse);
        }

        if (error.code === "P2025") {
            errorResponse.message = "Record to update not found.";
            return res.status(404).json(errorResponse);
        }

        errorResponse.message = error.message;
        return res.status(400).send(errorResponse);
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        errorResponse.message = "Valid input not provided";
        errorResponse.fullError = error;
        return res.status(400).json(errorResponse);
    }

    if (error instanceof APIError) {
        return res.status(error.errorCode).json(errorResponse);
    }

    console.log(error);
    return res.status(500).json(error);
};

export default errorHandler;