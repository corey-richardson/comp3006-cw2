import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
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
        default: []
    },
}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);

export default Post;
