import express from "express";

import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import { getPrivacy, updatePrivacy, validateClientId } from "../controllers/privacyController.js";


const router = express.Router();

router.get("/", asyncWrapper(getPrivacy));

router.post("/", asyncWrapper(updatePrivacy));

router.post("/validate", asyncWrapper(validateClientId));


export default router;
