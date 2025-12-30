const express = require("express");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

const {
    getPosts,
    getPost,
    getUsersPosts,
    getFollowingPosts,
    createPost,
    deletePost,
    updatePost
} = require("../controllers/postController");

// Routes relative to "/api/posts"
// PUBLIC ROUTES
router.get("/", getPosts);
router.get("/:id", getPost);
router.get("/user/:username", getUsersPosts);
// MIDDLEWARE
router.use(requireAuth);
// PROTECTED ROUTES
router.get("/following", getFollowingPosts);
router.post("/", createPost);
router.delete("/:id", deletePost);
router.patch("/:id", updatePost);

module.exports = router;
