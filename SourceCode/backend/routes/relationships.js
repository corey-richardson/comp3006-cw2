const express = require("express");
const router = express.Router();

const {
    followUser,
    unfollowUser,
    getFollowing,
    getFollowers,
} = require("../controllers/relationshipController");

// Routes relative to "/api/relationships"
router.post("/:targetUserId", followUser);
router.delete("/:targetUserId", unfollowUser);
router.get("/following/:userId", getFollowing);
router.get("/followers/:userId", getFollowers);

module.exports = router;
