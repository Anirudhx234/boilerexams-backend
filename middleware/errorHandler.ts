import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { APIError, InvalidCourseError, InvalidSeasonError, NotFoundError } from "./errors/index.js";
import axios from "axios";
import {MulterError} from "multer";

export default async function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
    if (!(error instanceof Error)) {
        res.status(500).send(`Unknown error type: ${typeof Error}`);
        return;
    }

    const errorResponse: ErrorResponse = {
        message: error.message,
        fullError: {},
    };

    if (req.user) {
        if (["ADMIN", "CONTENT"].includes(req.user.role)) {
            errorResponse.fullError = error;
        }
    }

    if (error instanceof NotFoundError) {
        return res.status(error.errorCode).json(errorResponse);
    }

    if (error instanceof InvalidSeasonError) {
        return res.status(error.errorCode).json(errorResponse);
    }

    if (error instanceof InvalidCourseError) {
        return res.status(error.errorCode).json(errorResponse);
    }

    if (error instanceof MulterError && error.code == "LIMIT_FILE_SIZE") {
        if (error.field === "image") {
            errorResponse.message = "Image size must be under 1 MB";
        } else if (error.field === "pdf") {
            errorResponse.message = "PDF size must be under 5 MB";
        }
        return res.status(413).json(errorResponse);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
        return res.status(400).json(errorResponse);
    }

    if (error instanceof APIError) {
        return res.status(error.errorCode).json(errorResponse);
    }

    try {
        await axios.post(`${process.env["DISCORD_URL"]}/error`, { stackTrace: error.stack });
    } catch {
        console.log("Unable to POST error to Discord");
    }

    console.log(error);
    errorResponse.message = "An error occurred";
    return res.status(500).json(errorResponse);
}

