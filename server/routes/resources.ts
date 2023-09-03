import express from 'express'
import {
    getResource,
    createImageResource,
    createImageResourceFromLink,
    createCodeResource,
    updateCodeResource,
    deleteResource
} from "../controllers/resourceController.js"
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js"
import authHandler from '../middleware/auth/authHandler.js';
import upload from "../middleware/multer/image.js"

const app = express();

app.get("/:resourceId", asyncWrapper(getResource))

app.post("/images", authHandler, upload.single('image'), asyncWrapper(createImageResource))

app.post("/images/link", authHandler, asyncWrapper(createImageResourceFromLink))

app.post("/codes", authHandler, asyncWrapper(createCodeResource))

app.put("/:resourceId/code", authHandler, asyncWrapper(updateCodeResource))

app.delete("/:resourceId", authHandler, asyncWrapper(deleteResource))

export default app