const express = require("express");

const {
    getComments,
    createComment,
    deleteComment,
    updateComment,
} = require("../controllers/commentController");
const requireAuth = require("../middleware/requireAuth");

// Need to inherit :postId from parent router ("/api/posts/:postId/comments")
const router = express.Router({ mergeParams: true });

// Routes relative to "/api/posts/:postId/comments"
// PUBLIC ROUTES
router.get("/", getComments);
// MIDDLEWARE
router.use(requireAuth);
// PROTECTED ROUTES
router.post("/", createComment);
router.delete("/:commentId", deleteComment);
router.patch("/:commentId", updateComment);

module.exports = router;
