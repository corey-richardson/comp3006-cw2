const mongoose = require("mongoose");

const Comment = require("../models/commentModel");
const Post = require("../models/postModel");

const getComments = async (request, response) => {
    const { postId } = request.params;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return response.status(400).json({error: "Invalid Post ID format."});
    }

    const post = await Post.findById( postId );
    if (!post) {
        return response.status(404).json({error: "Post not found."});
    }

    const comments = await Comment.find({ post_id: postId });
    response.status(200).json(comments); 
}


const createComment = async (request, response) => {
    const { post_id, author_id, body } = request.body;

    let emptyFields = [];
    if (!post_id) emptyFields.push("post_id");
    if (!author_id) emptyFields.push("author_id");
    if (!body) emptyFields.push("body");
    if (emptyFields.length > 0)
        return response.status(400).json({ error: "Please fill in all fields.", emptyFields });

    try {
        const comment = await Comment.create({
            post_id, author_id, body
        });

        const io = request.app.get("socketio");
        io.emit("new_comment", comment);

        response.status(201).json(comment);
    } catch (e) {
        response.status(500).json({ error: e.message });
    }
}


const deleteComment = async (request, response) => {
    const { commentId } = request.params;
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return response.status(400).json({error: "Invalid ID format."});
    }

    const comment = await Comment.findByIdAndDelete(commentId);
    if (!comment) {
        return response.status(404).json({error: "Comment not found."});
    }

    const io = request.app.get("socketio");
    io.emit("deleted_comment", commentId);

    response.status(204);
}


const updateComment = async (request, response) => {
    const { commentId } = request.params;
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return response.status(400).json({error: "Invalid ID format."});
    }

    const comment = await Comment.findByIdAndUpdate(commentId, { ...request.body });
    if (!comment) {
        return response.status(404).json({error: "Comment not found."});
    }

    response.status(200).json(comment);
}

module.exports = { getComments, createComment, deleteComment, updateComment };
