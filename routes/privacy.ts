import express from "express";

import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import { getPrivacy, togglePrivacy } from "../controllers/privacyController.js";


const router = express.Router();

router.get("/", asyncWrapper(getPrivacy));

router.post("/", asyncWrapper(togglePrivacy));


export default router;
