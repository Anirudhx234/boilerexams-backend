import express from 'express';
import { getResource, createImageResource, createImageResourceFromLink, createCodeResource, updateCodeResource, deleteResource } from "../controllers/resourceController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import authHandler from '../middleware/auth/authHandler.js';
import upload from "../middleware/multer/image.js";
const app = express();
app.get("/resources/:resourceId", asyncWrapper(getResource));
app.post("/resources/images", authHandler, upload.single('image'), asyncWrapper(createImageResource));
app.post("/resources/images/link", authHandler, asyncWrapper(createImageResourceFromLink));
app.post("/resources/codes", authHandler, asyncWrapper(createCodeResource));
app.put("/resources/:resourceId/code", authHandler, asyncWrapper(updateCodeResource));
app.delete("/resources/:resourceId", authHandler, asyncWrapper(deleteResource));
export default app;
//# sourceMappingURL=resources.js.map