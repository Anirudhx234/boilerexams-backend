import express from "express";
import {
    createCodeResource,
    createImageResource,
    createImageResourceFromLink,
    deleteResource,
    getResource,
    updateImageResource,
    updateCodeResource,
} from "../controllers/resourceController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import upload from "../middleware/multer/image.js";

const router = express.Router();

/*
router.get("/:resourceId", asyncWrapper(getResource));

router.post("/images", upload.single("image"), asyncWrapper(createImageResource));

router.post("/images/link", asyncWrapper(createImageResourceFromLink));

router.post("/codes", asyncWrapper(createCodeResource));

router.put("/:resourceId/image", asyncWrapper(updateImageResource));

router.put("/:resourceId/code", asyncWrapper(updateCodeResource));

router.delete("/:resourceId", asyncWrapper(deleteResource));

 */

export default router;
