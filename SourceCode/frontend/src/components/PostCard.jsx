import clsx from "clsx";
import { User, MessageCircle, Heart, Trash, Pencil } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import EditPost from "../components/EditPost";
import FollowButton from "../components/FollowButton";
import { useAuthContext } from "../hooks/useAuthContext";
import { usePosts } from "../hooks/usePosts";
import styles from "../styles/PostCard.module.css";

const PostCard = ({ post }) => {
    const { user, authIsReady } = useAuthContext();
    const { deletePost, toggleLike } = usePosts();

    const [ isEditing, setIsEditing ] = useState(false);

    const author = post?.author_id;
    const isOwner = authIsReady && user && author && user._id === author._id;

    const hasLiked = user && post.likes?.includes(user._id);

    const navigate = useNavigate();

    const handleLike = () => toggleLike(post._id);
    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            deletePost(post._id);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.avatar}>
                    <User size={24} />
                </div>
                <div className={styles.userInformation}>
                    <div className={styles.usernameRow}>
                        <Link
                            to={`/profile/${author.username}`}
                            className={clsx(styles.username, { [styles.owner]: isOwner })}
                        >
                            {author.username || "Anonymous"}
                        </Link>

                        {!isOwner && user && <FollowButton targetUser={author?._id} />}
                    </div>
                    <span className={styles.fullName}>{author?.firstName} {author?.lastName}</span>
                </div>
            </div>

            <div className={styles.body}>
                { isEditing ? (
                    <EditPost
                        post={post}
                        closeEdit={() => setIsEditing(false)}
                    />
                ) : (
                    post.body
                )}
            </div>

            <div className={styles.footer}>
                <button
                    className={styles.actionButton}
                    onClick={handleLike}
                    disabled={!user || isOwner}
                >
                    <Heart
                        size={18}
                        fill={ hasLiked ? "red" : "none" }
                        color={ hasLiked ? "red" : "currentColor" }
                    />
                    <span>{ post.totalLikes || 0 }</span>
                </button>

                <button
                    className={styles.actionButton}
                    onClick={() => navigate(`/post/${post._id}`)}
                >
                    <MessageCircle size={18} />
                    <span>{ post.totalComments || 0 }</span>
                </button>

                {isOwner && !isEditing && (
                    <>
                        <button
                            className={styles.actionButton}
                            onClick={() => setIsEditing(true)}
                        >
                            <Pencil size={18} />
                            <span>Edit</span>
                        </button>

                        <button
                            className={`${styles.actionButton} ${styles.deleteAction}`}
                            onClick={handleDelete}
                        >
                            <Trash size={18} />
                            <span>Delete</span>
                        </button>
                    </>
                )}

                <span className={styles.date}>
                    { new Date(post.createdAt).toLocaleString() }
                    {/* { post.createdAt !== post.updatedAt && (
                        <span>
                            (Edited)
                        </span>
                    ) } <-- likes count as updates so this doesnt work as intended :( */}
                </span>
            </div>
        </div>
    );
};

export default PostCard;
