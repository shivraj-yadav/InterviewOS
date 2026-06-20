import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createSession,
  getActiveSessions,
  getMyRecentSessions,
  getSessionById,
  joinSession,
  endSession,
  updateSession
} from "../controllers/sessionControllers.js";

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log("=== SESSION ROUTE DEBUG ===");
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("Full URL:", req.originalUrl);
  console.log("========================");
  next();
});

router.post("/", protectRoute, createSession);
router.get("/active", protectRoute, getActiveSessions);
router.get("/my-recent", protectRoute, getMyRecentSessions);

router.get("/:id", protectRoute, getSessionById);
router.post("/:id/join", protectRoute, joinSession);
router.post("/:id/end", protectRoute, endSession);
router.patch("/:id", protectRoute, updateSession);

export default router;
