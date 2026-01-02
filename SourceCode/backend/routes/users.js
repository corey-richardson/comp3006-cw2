const express = require("express");

const {
    getFollowing,
    getFollowers
} = require("../controllers/relationshipController");
const {
    loginUser,
    signupUser,
    deleteUser,
    getUserById,
    getUserByUsername,
} = require("../controllers/userController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// Routes relative to "/api/users"
// PUBLIC ROUTES
router.post("/login", loginUser);
router.post("/signup", signupUser);
router.get("/id/:id", getUserById);
router.get("/username/:username", getUserByUsername);
/** Routes controlled by relationshipController but on the `/api/users` path as
    followings and followers are a subresource of users; RESTful API design. */
router.get("/username/:username/following", getFollowing);
router.get("/username/:username/followers", getFollowers);
// MIDDLEWARE
router.use(requireAuth);
// PROTECTED ROUTES
router.delete("/:id", deleteUser);

module.exports = router;
