import mongoose from "mongoose";

import { addPostMetricsHelper } from "./utils";
import Comment from "../models/commentModel";
import Post from "../models/postModel";

export const getComments = async (request, response) => {
    const { postId } = request.params;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return response.status(400).json({ error: "Invalid Post ID format." });
    }

    const post = await Post.findById( postId );
    if (!post) {
        return response.status(404).json({ error: "Post not found." });
    }

    const [ comments, totalComments ] = await Promise.all([
        await Comment.find({ post_id: postId })
            .populate("author_id", "username firstName lastName")
            .sort({ createdAt: -1 }),
        await Comment.countDocuments({ post_id: postId })
    ]);

    response.status(200).json({ comments, totalComments });
};

export const createComment = async (request, response) => {
    const { post_id, body } = request.body;
    const author_id = request.user._id;

    let emptyFields = [];
    if (!post_id) emptyFields.push("post_id");
    if (!body) emptyFields.push("body");
    if (emptyFields.length > 0)
        return response.status(400).json({ error: "Please fill in all fields.", emptyFields });

    try {
        const comment = await Comment.create({
            post_id, author_id, body
        });

        const populatedComment = await comment.populate("author_id", "username firstName lastName");

        const io = request.app.get("socketio");
        io.emit("new_comment", populatedComment);

        // Ugly
        const post = await Post.findById(post_id).populate("author_id", "username firstName lastName");
        const [ postWithMetrics ] = await addPostMetricsHelper([ post ]);
        io.emit("updated_post", postWithMetrics);

        response.status(201).json(comment);
    } catch (e) {
        response.status(500).json({ error: e.message });
    }
};

export const deleteComment = async (request, response) => {
    const { commentId } = request.params;
    const userId = request.user._id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return response.status(400).json({ error: "Invalid ID format." });
    }

    const comment = await Comment.findOneAndDelete({
        _id: commentId,
        author_id: userId,
    });
    if (!comment) {
        return response.status(404).json({ error: "Comment not found." });
    }

    const io = request.app.get("socketio");
    io.emit("deleted_comment", commentId);

    // Ugly
    const post = await Post.findById(comment.post_id).populate("author_id", "username firstName lastName");
    const [ postWithMetrics ] = await addPostMetricsHelper([ post ]);
    io.emit("updated_post", postWithMetrics);

    response.status(200).json(comment);
};

export const updateComment = async (request, response) => {
    const { commentId } = request.params;
    const userId = request.user._id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return response.status(400).json({ error: "Invalid ID format." });
    }

    const comment = await Comment.findOneAndUpdate(
        { _id: commentId, author_id: userId },
        { ...request.body }
    );

    if (!comment) {
        return response.status(404).json({ error: "Comment not found." });
    }

    response.status(200).json(comment);
};
