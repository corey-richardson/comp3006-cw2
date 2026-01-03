import express from "express";

import { getFollowing, getFollowers } from "../controllers/relationshipController";

import {
    loginUser,
    signupUser,
    deleteUser,
    getUserById,
    getUserByUsername,
}  from "../controllers/userController";

import requireAuth from "../middleware/requireAuth";

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

export default router;
