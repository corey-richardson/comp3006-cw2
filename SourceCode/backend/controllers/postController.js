const mongoose = require("mongoose");

const Post = require("../models/postModel");
const User = require("../models/userModel");

const getPosts = async (request, response) => {
    const posts = await Post.find({}).sort({ createdAt: -1 });
    response.status(200).json(posts);
};


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


const getUsersPosts = async (request, response) => {
    const { username } = request.params;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return response.status(404).json({ error: "User not found." });
        }

        const posts = await Post.find({ author_id: user._id })
            .populate("author_id", "username firstName lastName")
            .sort({ createdAt: -1 });

        response.status(200).json(posts);
    } catch (e) {
        response.status(500).json({ error: e.message });
    }
};


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


module.exports = { getPosts, getPost, getUsersPosts, createPost, deletePost, updatePost };
