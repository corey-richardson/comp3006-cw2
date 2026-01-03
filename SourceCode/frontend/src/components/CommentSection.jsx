import clsx from "clsx";
import { Ban, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import CommentCard from "./CommentCard";
import { useAuthContext } from "../hooks/useAuthContext";
import commentStyles from "../styles/Comments.module.css";
import formStyles from "../styles/Forms.module.css";

const CommentSection = ({ postId }) => {
    const { user } = useAuthContext();

    const [ comments, setComments ] = useState([]);
    const [ body, setBody ] = useState("");

    const [ isLoading, setIsLoading ] = useState(false);
    const [ error, setError ] = useState(null);

    const MAX_LENGTH = 512;

    /** Comments are only visible here so don't need to be wrapped in a global context. *maybe?* */

    const baseUrl = process.env.REACT_APP_API_BASE_URL || "/api";
    const socketUrl = process.env.REACT_APP_BASE_URL || "/";

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch(`${baseUrl}/posts/${postId}/comments`);
                const json = await response.json();

                if (!response.ok) {
                    throw new Error(json.error || "Failed to fetch comments.");
                }

                setComments(json.comments);

            } catch (error) {
                setError(error);
            }
        };

        fetchComments();
    }, [ postId, baseUrl ]);

    useEffect(() => {
        const socket = io(socketUrl);

        socket.on("new_comment", (comment) => {
            if (comment.post_id === postId) {
                setComments((prev) => [ comment, ...prev ]);
            }
        });

        socket.on("deleted_comment", (commentId) => {
            setComments((prev) => prev.filter(comment => comment._id !== commentId));
        });

        return () => socket.disconnect();
    }, [ postId, socketUrl ]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) return;
        setIsLoading(true);

        try {
            const response = await fetch(`${baseUrl}/posts/${postId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify({ body, post_id: postId })
            });

            const json = await response.json();
            if (!response.ok) {
                throw new Error(json.error || "Failed to post comment.");
            }

            setBody("");
            setError(null);
            // Socket adds comment to list

        } catch (error) {
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            { user && (
                <form onSubmit={handleSubmit} className={ `${formStyles.form} ${commentStyles.formExtended}` }>
                    <div className={formStyles.inputWrapper}>
                        <textarea
                            name="body" id="body"
                            placeholder="Lorem Ipsum..."
                            onChange={(e) => { setBody(e.target.value); }}
                            value={ body }
                            required
                            disabled={ isLoading }
                            maxLength={MAX_LENGTH}
                        ></textarea>

                        { error && (
                            <p className="error">
                                <Ban size={18} />
                                { error || error.message }
                            </p>
                        )}

                        <div className={clsx(formStyles.counter, {
                            [formStyles.counterWarning]: body.length >= MAX_LENGTH - 20,
                            [formStyles.counterMax]: body.length >= MAX_LENGTH
                        })}>
                            {body.length} / {MAX_LENGTH}
                        </div>
                    </div>

                    <button
                        className={formStyles.formButton}
                        type="submit"
                        disabled={isLoading}
                    >
                        { isLoading ? "Posting..." : (
                            <>
                                <Send size={18} />
                                Post
                            </>
                        )}
                    </button>

                </form>
            )}

            <div className={commentStyles.list}>
                { comments.length > 0 ? (
                    comments.map((comment) => (
                        <CommentCard key={comment._id} comment={comment} postId={postId} />
                    ))
                ) : (
                    <p className="centred">No comments yet. Be the first!</p>
                )}
            </div>
        </>
    );
};

export default CommentSection;
