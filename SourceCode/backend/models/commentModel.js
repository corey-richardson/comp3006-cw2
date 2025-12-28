const mongoose = require("mongoose");

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
        type: Number,
        default: 0,
    },
}, { timestamps: true });

module.exports = mongoose.model("Comment", commentSchema);