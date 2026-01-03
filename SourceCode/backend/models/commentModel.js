import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    author_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    body: {
        type: String,
        required: true,
        maxLength: 512,
    },
    likes: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: "User",
        default: [],
    },
}, { timestamps: true });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
