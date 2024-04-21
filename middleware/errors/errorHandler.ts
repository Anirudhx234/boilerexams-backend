import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import APIError from "./APIError.js";
import axios from "axios";
import {MulterError} from "multer";
import { ZodError } from "zod";

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

    if (error instanceof MulterError) {
        const err = error as MulterError;
        if (err.code == "LIMIT_FILE_SIZE") {
            if (err.field === "image") {
                errorResponse.message = "Image size must be under 1 MB";
            } else if (err.field === "pdf") {
                errorResponse.message = "PDF size must be under 5 MB";
            }

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

    if (error instanceof APIError) {
        errorResponse.message = error.message;
        return res.status(error.errorCode).json(errorResponse);
    }

    if (error instanceof ZodError) {
        const err = error as ZodError;
        errorResponse.message = "Zod: Valid input not provided";
        errorResponse.fullError = err.errors;

        try {
            await axios.post(`${process.env["DISCORD_URL"]}/error`, {
                ...err.format(),
                path: req.path
            });
        } catch {
            console.log("Unable to POST error to Discord");
        }

        return res.status(400).json(errorResponse);
    }

    try {
        await axios.post(`${process.env["DISCORD_URL"]}/error`, {
            stackTrace: error.stack,
            path: req.path
        });
    } catch {
        console.log("Unable to POST error to Discord");
    }

    console.log(error);
    errorResponse.message = "An unknown error occurred";
    return res.status(500).json(errorResponse);
}

