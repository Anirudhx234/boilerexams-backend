import express from "express";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import { createResource, deleteResource, getResource, updateResource } from "../controllers/resourceController.js";
import upload from "../middleware/multer/pdf.js";


const router = express.Router();


router.get("/:resourceId", asyncWrapper(getResource));

router.post("/", upload.single("image"), asyncWrapper(createResource));

router.put("/:resourceId", upload.single("image"), asyncWrapper(updateResource));

router.delete("/:resourceId", asyncWrapper(deleteResource));


export default router;
