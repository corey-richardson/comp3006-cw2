const express = require("express");

const {
    getPosts,
    getPost,
    getUsersPosts,
    getFollowingPosts,
    createPost,
    deletePost,
    updatePost,
    likePost
} = require("../controllers/postController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// Routes relative to "/api/posts"
// PUBLIC ROUTES
router.get("/", getPosts);
router.get("/post/:id", getPost);
router.get("/user/:username", getUsersPosts);
// MIDDLEWARE
router.use(requireAuth);
// PROTECTED ROUTES
router.get("/following", getFollowingPosts);
router.post("/", createPost);
router.delete("/post/:id", deletePost);
router.patch("/post/:id", updatePost);
router.patch("/post/:id/like", likePost);

module.exports = router;
