const mongoose = require("mongoose");

const Comment = require("../models/commentModel");
const Post = require("../models/postModel");
const Relationship = require("../models/relationshipModel");
const User = require("../models/userModel");

const DEFAULT_LOAD_LIMIT = 10;

const addPostMetricsHelper = async (posts) => {
    return await Promise.all(posts.map(async (post) => {
        const totalComments = await Comment.countDocuments({ post_id: post._id });
        const totalLikes = post.likes ? post.likes.length : 0;
        return {
            ...post._doc,
            totalComments,
            totalLikes
        };
    }));
};

const getPost = async (request, response) => {
    const { id } = request.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return response.status(400).json({ error: "Invalid ID format." });
    }

    const post = await Post
        .findById(id)
        .populate("author_id", "username firstName lastName");
    if (!post) {
        return response.status(404).json({ error: "Post not found." });
    }

    const [ postWithMetrics ] = await addPostMetricsHelper([ post ]);

    response.status(200).json(postWithMetrics);
};

const getPosts = async (request, response) => {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || DEFAULT_LOAD_LIMIT;
    const skip = (page - 1) * limit;

    try {
        const [ posts, totalPosts ] = await Promise.all([
            Post.find({})
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("author_id", "username firstName lastName"),
            Post.countDocuments()
        ]);

        const postsWithMetrics = await addPostMetricsHelper(posts);

        response.status(200).json({
            posts: postsWithMetrics,
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
    const limit = parseInt(request.query.limit) || DEFAULT_LOAD_LIMIT;
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
            Post.find({ author_id: user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("author_id", "username firstName lastName"),
            Post.countDocuments({ author_id: user._id })
        ]);

        const postsWithMetrics = await addPostMetricsHelper(posts);

        response.status(200).json({
            posts: postsWithMetrics,
            currentPage: page,
            pages: Math.ceil(totalPosts / limit),
            hasMore: skip + posts.length < totalPosts,
            totalPosts,
        });
    } catch (e) {
        response.status(500).json({ error: e.message });
    }
};

const getFollowingPosts = async (request, response) => {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || DEFAULT_LOAD_LIMIT;
    const skip = (page - 1) * limit;

    const currentUserId = request.user._id;

    try {
        const following = await Relationship.find({
            follower_id: currentUserId
        }).select("following_id");

        const followingIds = following.map(f => f.following_id);
        followingIds.push(currentUserId);

        const [ posts, totalPosts ] = await Promise.all([
            Post.find({ author_id: { $in: followingIds } })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("author_id", "username firstName lastName"),
            Post.countDocuments({ author_id: { $in: followingIds } })
        ]);

        const postsWithMetrics = await addPostMetricsHelper(posts);

        response.status(200).json({
            posts: postsWithMetrics,
            currentPage: page,
            pages: Math.ceil(totalPosts / limit),
            hasMore: skip + posts.length < totalPosts
        });
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

        await post.populate("author_id", "username firstName lastName");

        const io = request.app.get("socketio");
        if (io) {
            io.emit("new_post", post);
        }

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
        { ...request.body },
        { new: true }
    ).populate("author_id", "username firstName lastName");

    if (!post) {
        return response.status(404).json({ error: "Post not found." });
    }

    const [ postWithMetrics ] = await addPostMetricsHelper([ post ]);

    const io = request.app.get("socketio");
    if (io) {
        io.emit("updated_post", postWithMetrics);
    }

    response.status(200).json(post);
};

const likePost = async (request, response) => {
    const { id } = request.params;
    const userId = request.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return response.status(400).json({ error: "Invalid ID format." });
    }

    try {
        const post = await Post.findById(id);
        if (!post) {
            return response.status(404).json({ error: "Post not found." });
        }

        const alreadyLiked = post.likes.some(likeId => String(likeId) === String(userId));

        // https://mongoosejs.com/docs/5.x/docs/api/array.html#mongoosearray_MongooseArray-addToSet
        const updateQuery = alreadyLiked
            ? { $pull: { likes: userId } }
            : { $addToSet: { likes: userId } };

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            updateQuery,
            { new: true }
        ).populate("author_id", "username firstName lastName");

        const totalComments = await Comment.countDocuments({ post_id: id });
        const postWithMetrics = {
            ...updatedPost._doc,
            totalLikes: updatedPost.likes.length,
            totalComments
        };

        const io = request.app.get("socketio");
        if (io) {
            io.emit("updated_post", postWithMetrics);
        }

        response.status(200).json(postWithMetrics);
    } catch (e) {
        response.status(500).json({ error: e.message });
    }
};

module.exports = {
    addPostMetricsHelper,
    getPosts, getPost, getUsersPosts, getFollowingPosts,
    createPost, deletePost, updatePost,
    likePost
};
