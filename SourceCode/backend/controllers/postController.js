const mongoose = require("mongoose");

const Post = require("../models/postModel");
const User = require("../models/userModel");

const getPost = async (request, response) => {
    const { id } = request.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return response.status(400).json({ error: "Invalid ID format." });
    }

    const post = await Post.findById(id);
    if (!post) {
        return response.status(404).json({ error: "Post not found." });
    }

    response.status(200).json(post);
};

const getPosts = async (request, response) => {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 50;
    const skip = (page - 1) * limit;

    try {
        const posts = await Post.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("author", "username");

        const totalPosts = await Post.countDocuments();

        response.status(200).json({
            posts,
            currentPage: page,
            pages: Math.ceil(totalPosts / limit),
            hasMore: skip + posts.length < totalPosts
        });
    } catch (e) {
        response.status(500).json({ error: e.message });
    }
};

const getUsersPosts = async (request, response) => {
    const { username } = request.params;

    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 50;
    const skip = (page - 1) * limit;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return response.status(404).json({ error: "User not found." });
        }

        // const posts = await Post.find({ author_id: user._id })
        //     .sort({ createdAt: -1 })
        //     .skip(skip)
        //     .limit(limit)
        //     .populate("author_id", "username firstName lastName");

        // const totalPosts = await Post.countDocuments({ author_id: user._id });

        const [ posts, totalPosts ] = await Promise.all([
            await Post.find({ author_id: user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("author_id", "username firstName lastName"),
            await Post.countDocuments({ author_id: user._id })
        ]);

        response.status(200).json({
            posts,
            currentPage: page,
            pages: Math.ceil(totalPosts / limit),
            hasMore: skip + posts.length < totalPosts
        });
    } catch (e) {
        response.status(500).json({ error: e.message });
    }
};

const getFollowingPosts = async (request, response) => {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 50;
    const skip = (page - 1) * limit;

    const currentUserId = request.user_id;

    try {
        const following = await Relationship.find({
            follower_id: currentUserId
        }).select("following_id");
        const followingIds = following.map(f => f.following_id);

        const [ posts, totalPosts ] = await Promise.all([
            await Post.find({ author: { $in: followingIds }})
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("author_id", "username firstName lastName"),
            await Post.countDocuments({ author: { $in: followingIds }})
        ]);

        response.status(200).json({
            posts,
            currentPage: page,
            pages: Math.ceil(totalPosts / limit),
            hasMore: skip + posts.length < totalPosts
        });
    } catch (e) {
        response.status(500).json({ error: e.message });
    }
}

const createPost = async (request, response) => {
    const { body } = request.body;
    const author_id = request.user._id;

    let emptyFields = [];
    if (!body) emptyFields.push("body");
    if (emptyFields.length > 0)
        return response.status(400).json({ error: "Please fill in all fields.", emptyFields });

    try {
        const post = await Post.create({
            author_id, body
        });

        const io = request.app.get("socketio");
        io.emit("new_post", await post.populate("author", "username"));

        response.status(201).json(post);
    }
    catch (e) {
        response.status(500).json({ error: e.message });
    }
};


const deletePost = async (request, response) => {
    const { id } = request.params;
    const author_id = request.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return response.status(400).json({ error: "Invalid ID format." });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const post = await Post.findOneAndDelete({
            _id: id,
            author_id
        }).session(session);

        if (!post) {
            await session.abortTransaction();
            session.endSession();
            return response.status(404).json({ error: "Post not found." });
        }

        await Comment.deleteMany({ post_id: id }).session(session);

        await session.commitTransaction();
        session.endSession();

        const io = request.app.get("socketio");
        io.emit("deleted_post", id);

        response.status(200).json(post);
    } catch (e) {
        await session.abortTransaction();
        session.endSession();
        response.status(500).json({ error: e.message });
    }
};


const updatePost = async (request, response) => {
    const { id } = request.params;
    const author_id = request.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return response.status(400).json({ error: "Invalid ID format." });
    }

    const post = await Post.findOneAndUpdate(
        { _id: id, author_id },
        { ...request.body }
    );
    if (!post) {
        return response.status(404).json({ error: "Post not found." });
    }

    response.status(200).json(post);
};


module.exports = { getPosts, getPost, getUsersPosts, getFollowingPosts, createPost, deletePost, updatePost };
