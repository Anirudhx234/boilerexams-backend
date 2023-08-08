import express from 'express'
import {
    getResource,
    createImageResource,
    createImageResourceFromLink,
    createCodeResource,
    updateCodeResource,
    deleteResource
} from "../controllers/resourceController"
import asyncWrapper from "../middleware/wrappers/asyncWrapper"
import authHandler from '../middleware/auth/authHandler';
import upload from "../middleware/multer/image"

const app = express();

app.get("/resources/:resourceId", asyncWrapper(getResource))

app.post("/resources/images", authHandler, upload.single('image'), asyncWrapper(createImageResource))

app.post("/resources/images/link", authHandler, asyncWrapper(createImageResourceFromLink))

app.post("/resources/codes", authHandler, asyncWrapper(createCodeResource))

app.put("/resources/:resourceId/code", authHandler, asyncWrapper(updateCodeResource))

app.delete("/resources/:resourceId", authHandler, asyncWrapper(deleteResource))

export default app