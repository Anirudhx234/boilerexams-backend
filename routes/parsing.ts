import express from "express";
import { Role } from "@prisma/client";
import authHandler from "../middleware/auth/authHandler.js";
import upload from "../middleware/multer/file.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import { getIdResults, parseFromFile, parseFromLink } from "../controllers/parsingController.js";

const router = express.Router();

router.post("/convert-link", authHandler(Role.CONTENT), asyncWrapper(parseFromLink));

router.post("/convert-file", upload.single("pdf"), authHandler(Role.CONTENT), asyncWrapper(parseFromFile));

router.post("/convert-id", authHandler(Role.CONTENT), asyncWrapper(getIdResults));

export default router;
