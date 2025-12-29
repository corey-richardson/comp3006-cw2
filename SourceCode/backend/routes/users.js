const express = require("express");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

const {
    loginUser,
    signupUser,
    deleteUser,
    getUserById,
    getUserByUsername,
} = require("../controllers/userController");

// Routes relative to "/api/users"
// PUBLIC ROUTES
router.post("/login", loginUser);
router.post("/signup", signupUser);
router.get("/id/:id", getUserById);
router.get("/username/:username", getUserByUsername);
// MIDDLEWARE
router.use(requireAuth);
// PROTECTED ROUTES
router.delete("/:id", deleteUser);

module.exports = router;
