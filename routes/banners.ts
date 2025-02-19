import express from "express";
import { Role } from "@prisma/client";
import authHandler from "../middleware/auth/authHandler.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import {
    createBanner,
    getActiveBanners,
    dismissBanner,
    updateBanner,
    deleteBanner
} from "../controllers/bannerController.js";

const router = express.Router();

router.get("/", asyncWrapper(getActiveBanners));

router.post("/:bannerId/dismiss", asyncWrapper(dismissBanner));

router.post("/", authHandler(Role.ADMIN), asyncWrapper(createBanner));
router.put("/:bannerId", authHandler(Role.ADMIN), asyncWrapper(updateBanner));
router.delete("/:bannerId", authHandler(Role.ADMIN), asyncWrapper(deleteBanner));

export default router; 