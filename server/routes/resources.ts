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
import authorizedHandler from '../middleware/auth/authorizedHandler';

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

app.post("/resources/images", authorizedHandler, upload.single('image'), asyncWrapper(createImageResource))

app.post("/resources/images/link", authorizedHandler, asyncWrapper(createImageResourceFromLink))

app.post("/resources/codes", authorizedHandler, asyncWrapper(createCodeResource))

app.put("/resources/:resourceId/code", authorizedHandler, asyncWrapper(updateCodeResource))

app.delete("/resources/:resourceId", authorizedHandler, asyncWrapper(deleteResource))

export default app