import express from "express";

import { followUser, unfollowUser }  from "../controllers/relationshipController";
import requireAuth from "../middleware/requireAuth";

const router = express.Router();

// Routes relative to "/api/relationships"
// PUBLIC ROUTES

// MIDDLEWARE
router.use(requireAuth);
// PROTECTED ROUTES
router.post("/:targetUserId", followUser);
router.delete("/:targetUserId", unfollowUser);

export default router;
