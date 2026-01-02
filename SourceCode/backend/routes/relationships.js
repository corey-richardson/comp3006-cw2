const express = require("express");

const {
    followUser,
    unfollowUser,
} = require("../controllers/relationshipController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// Routes relative to "/api/relationships"
// PUBLIC ROUTES

// MIDDLEWARE
router.use(requireAuth);
// PROTECTED ROUTES
router.post("/:targetUserId", followUser);
router.delete("/:targetUserId", unfollowUser);

module.exports = router;
