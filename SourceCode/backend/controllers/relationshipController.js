const mongoose = require("mongoose");

const Relationship = require("../models/relationshipModel");
const User = require("../models/userModel");

const followUser = async (request, response) => {
    const { targetUserId } = request.params;
    const follower_id = request.user._id;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
        return response.status(400).json({ error: "Invalid Target User ID format." });
    }
    if (!mongoose.Types.ObjectId.isValid(follower_id)) {
        return response.status(400).json({ error: "Invalid Follower ID format." });
    }

    if (follower_id === targetUserId) {
        return response.status(400).json({ error: "You can't follow yourself..." });
    }

    try {
        const follow = await Relationship.create({
            follower_id,
            following_id: targetUserId,
        });

        const io = request.app.get("socketio");
        io.emit("new_follower", follow);

        response.status(201).json(follow);
    } catch (e) {
        if (e.code === 11000) {
            return response.status(400).json({ error: "You already follow this user." });
        }

        response.status(500).json({ error: e.message });
    }
};

const unfollowUser = async (request, response) => {
    const { targetUserId } = request.params;
    const follower_id = request.user._id;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
        return response.status(400).json({ error: "Invalid Target User ID format." });
    }
    if (!mongoose.Types.ObjectId.isValid(follower_id)) {
        return response.status(400).json({ error: "Invalid Follower ID format." });
    }

    if (follower_id === targetUserId) {
        return response.status(400).json({ error: "You can't unfollow yourself..." });
    }

    try {
        const unfollow = await Relationship.findOneAndDelete({
            follower_id,
            following_id: targetUserId,
        });

        if (!unfollow) {
            return response.status(404).json({ error: "Relationship not found." });
        }

        response.status(200).json(unfollow);
    } catch (e) {
        response.status(500).json({ error: e.message });
    }
};

const getFollowing = async (request, response) => {
    const { userId } = request.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return response.status(400).json({ error: "Invalid Target User ID format." });
    }

    try {
        if (!(await User.exists({ _id: userId }))) {
            return response.status(404).json({ error: "User not found." });
        }

        const following = await Relationship
            .find({ follower_id: userId })
            .populate("following_id", "username firstName lastName");

        response.status(200).json(following);
    } catch (e) {
        response.status(500).json({ error: e.message });
    }
};

const getFollowers = async (request, response) => {
    const { userId } = request.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return response.status(400).json({ error: "Invalid Target User ID format." });
    }

    try {
        if (!(await User.exists({ _id: userId }))) {
            return response.status(404).json({ error: "User not found." });
        }

        const followers = await Relationship
            .find({ following_id: userId })
            .populate("follower_id", "username firstName lastName");

        response.status(200).json(followers);
    } catch (e) {
        response.status(500).json({ error: e.message });
    }
};

module.exports = { followUser, unfollowUser, getFollowing, getFollowers };
