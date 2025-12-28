const mongoose = require("mongoose");

const relationshipSchema = new mongoose.Schema({
    follower_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    following_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });

// Source - https://stackoverflow.com/questions/14283503/unique-documents-using-multiple-values-in-mongoose-schema
// Posted by JohnnyHK
// Retrieved 2025-12-28, License - CC BY-SA 3.0
relationshipSchema.index({ follower_id: 1, following_id: 1 }, { unique: true });

module.exports = mongoose.model("Post", postSchema);
