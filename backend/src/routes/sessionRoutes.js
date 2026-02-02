import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {createSession,getActiveSession,getMyRecentSession,getSessionById,joinSessionById,endSession} from "../controllers/sessionControllers.js"
const router = express.Router();

// Debug middleware - must be first
router.use((req, res, next) => {
  console.log("=== SESSION ROUTE DEBUG ===");
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("Full URL:", req.originalUrl);
  console.log("Body:", req.body);
  console.log("Headers:", req.headers);
  console.log("========================");
  next();
});

router.post("/",protectRoute,createSession);
router.get("/active",protectRoute,getActiveSession);
router.get("/my-recent",protectRoute,getMyRecentSession);

router.get("/:id",protectRoute,getSessionById);
router.post("/:id/join",protectRoute,joinSessionById);
router.post("/:id/end",protectRoute,endSession);

export default router;
