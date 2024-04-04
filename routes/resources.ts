import express from "express";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import {
    deleteResource,
    getResource,
    upsertResource
} from "../controllers/resourceController.js";
import upload from "../middleware/multer/pdf.js";
import authHandler from "../middleware/auth/authHandler.js";
import { Role } from "@prisma/client";


const router = express.Router();


router.get("/:resourceId", asyncWrapper(getResource));

router.put("/", upload.single("image"), authHandler(Role.GRAPHIC), asyncWrapper(upsertResource));

router.delete("/:resourceId", authHandler(Role.GRAPHIC), asyncWrapper(deleteResource));


export default router;
