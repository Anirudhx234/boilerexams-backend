import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import axios from "axios";
import { MulterError } from "multer";
import { ZodError } from "zod";
import APIError from "./APIError.js";
import { DiscordAPI } from "../../services/discord.api.js";

export default async function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
    if (!(error instanceof Error)) {
        res.status(500).send(`Unknown error type: ${typeof error}`);
        return;
    }

    const errorResponse: ErrorResponse = {
        message: error.message,
        fullError: {}
    };

    if (req.user) {
        if (["ADMIN", "CONTENT"].includes(req.user.role)) {
            errorResponse.fullError = error;
        }
    }

    if (error instanceof APIError) {
        errorResponse.message = error.message;
        return res.status(error.errorCode).json(errorResponse);
    }

    await DiscordAPI.reportError(error, req.path, req.body, req.cookies["ClientId"], req.get('User-Agent'), req.get('origin'));

    if (error instanceof MulterError) {
        const err = error as MulterError;
        if (err.code == "LIMIT_FILE_SIZE") {
            errorResponse.message = "File size must be under 15 MB";
            return res.status(413).json(errorResponse);
        }
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const err = error as Prisma.PrismaClientKnownRequestError;

        if (err.code === "P2002") {
            errorResponse.message = "Duplicate record exists. Record not created.";
            return res.status(409).json(errorResponse);
        }

        if (err.code === "P2025") {
            errorResponse.message = "Record to update not found.";
            return res.status(404).json(errorResponse);
        }

        errorResponse.message = error.message;
        return res.status(400).send(errorResponse);
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        errorResponse.message = "Prisma: Valid input not provided";
        return res.status(400).json(errorResponse);
    }

    if (error instanceof ZodError) {
        const err = error as ZodError;
        errorResponse.message = "Zod: Valid input not provided";
        errorResponse.fullError = err.errors;

        return res.status(400).json(errorResponse);
    }

    console.log(error);
    errorResponse.message = "An unknown error occurred";
    return res.status(500).json(errorResponse);
}
