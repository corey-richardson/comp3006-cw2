const addPostMetricsHelper = async (posts, CommentModel) => {
    const Comment = CommentModel || require("../models/commentModel");

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

module.exports = {
    addPostMetricsHelper
};
