import express from "express";
import { Role } from "@prisma/client";
import authHandler from "../middleware/auth/authHandler.js";
import upload from "../middleware/multer/file.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import { deleteResource, getResource, uploadFile, upsertResource } from "../controllers/resourceController.js";

const router = express.Router();

router.get("/:resourceId", asyncWrapper(getResource));

router.post("/files", upload.single("file"), authHandler(Role.GRAPHIC), asyncWrapper(uploadFile));

router.put("/", upload.single("file"), authHandler(Role.GRAPHIC), asyncWrapper(upsertResource));

router.delete("/:resourceId", authHandler(Role.GRAPHIC), asyncWrapper(deleteResource));

export default router;
