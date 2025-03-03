import express from "express";

import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import { togglePrivacy } from "../controllers/privacyController.js";


const router = express.Router();

router.post("/", asyncWrapper(togglePrivacy));


export default router;
