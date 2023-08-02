import express from 'express'
import multer from 'multer'
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

const app = express();
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(new multer.MulterError('File type must be JPEG or PNG'))
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 500 * 1024
    }
});

app.get("/resources/:resourceId", asyncWrapper(getResource))

app.post("/resources/images", authHandler, upload.single('image'), asyncWrapper(createImageResource))

app.post("/resources/images/link", authHandler, asyncWrapper(createImageResourceFromLink))

app.post("/resources/codes", authHandler, asyncWrapper(createCodeResource))

app.put("/resources/:resourceId/code", authHandler, asyncWrapper(updateCodeResource))

app.delete("/resources/:resourceId", authHandler, asyncWrapper(deleteResource))

export default app