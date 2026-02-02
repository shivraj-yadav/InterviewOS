import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {createSession,getActiveSession,getMyRecentSession,getSessionById,joinSessionById,endSession} from "../controllers/sessionControllers.js"
const router = express.Router();

router.post("/",protectRoute,createSession);
router.get("/active",protectRoute,getActiveSession);
router.get("/my-recent",protectRoute,getMyRecentSession);

router.get("/:id",protectRoute,getSessionById);
router.post("/:id/join",protectRoute,joinSessionById);
router.post("/:id/end",protectRoute,endSession);


export default router;
