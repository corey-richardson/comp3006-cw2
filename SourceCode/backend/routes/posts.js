const express = require("express");
const router = express.Router();

const {
    getPosts,
    getPost,
    createPost,
    deletePost,
    updatePost
} = require("../controllers/postController");

// Routes relative to "/api/posts"
router.get("/", getPosts);
router.get("/:id", getPost);
router.post("/", createPost);
router.delete("/:id", deletePost);
router.patch("/:id", updatePost);

module.exports = router;
