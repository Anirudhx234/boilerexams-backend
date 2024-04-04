import express from "express";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import {
    deleteResource,
    getResource,
    upsertResource
} from "../controllers/resourceController.js";
import upload from "../middleware/multer/pdf.js";


const router = express.Router();


router.get("/:resourceId", asyncWrapper(getResource));

router.put("/", upload.single("image"), asyncWrapper(upsertResource));

router.delete("/:resourceId", asyncWrapper(deleteResource));


export default router;
