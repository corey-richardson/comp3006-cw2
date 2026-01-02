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

        const [ followerCount, followingCount ] = await Promise.all([
            Relationship.countDocuments({ following_id: targetUserId }),
            Relationship.countDocuments({ follower_id: targetUserId }),
        ]);

        const io = request.app.get("socketio");
        io.emit("relationship_update", {
            userId: targetUserId,
            followerCount,
            followingCount,
        });

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

        const [ followerCount, followingCount ] = await Promise.all([
            Relationship.countDocuments({ following_id: targetUserId }),
            Relationship.countDocuments({ follower_id: targetUserId }),
        ]);

        const io = request.app.get("socketio");
        io.emit("relationship_update", {
            userId: targetUserId,
            followerCount,
            followingCount,
        });

        response.status(200).json(unfollow);
    } catch (e) {
        response.status(500).json({ error: e.message });
    }
};

const getFollowing = async (request, response) => {
    const { username } = request.params;

    try {
        const user = await User.findOne({ username });
        if (!user) return response.status(404).json({ error: "User not found." });

        const following = await Relationship
            .find({ follower_id: user._id })
            .populate("following_id", "username firstName lastName");

        response.status(200).json(following);
    } catch (e) {
        response.status(500).json({ error: e.message });
    }
};

const getFollowers = async (request, response) => {
    const { username } = request.params;

    try {
        const user = await User.findOne({ username });
        if (!user) return response.status(404).json({ error: "User not found." });

        const followers = await Relationship
            .find({ following_id: user._id })
            .populate("follower_id", "username firstName lastName");

        response.status(200).json(followers);
    } catch (e) {
        response.status(500).json({ error: e.message });
    }
};

module.exports = { followUser, unfollowUser, getFollowing, getFollowers };
