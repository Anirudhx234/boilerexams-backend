import express from 'express';
import {
    createCodeResource,
    createImageResource,
    createImageResourceFromLink,
    deleteResource,
    getResource,
    updateCodeResource
} from "../controllers/resourceController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import authHandler from '../middleware/auth/authHandler.js';
import upload from "../middleware/multer/image.js";

const app = express();

app.get("/:resourceId", asyncWrapper(getResource));

app.post("/images", upload.single('image'), asyncWrapper(createImageResource));

app.post("/images/link", asyncWrapper(createImageResourceFromLink));

app.post("/codes", asyncWrapper(createCodeResource));

app.put("/:resourceId/code", asyncWrapper(updateCodeResource));

app.delete("/:resourceId", asyncWrapper(deleteResource));

export default app;