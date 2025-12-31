
import clsx from "clsx";
import { Ban, Send, XCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthContext } from "../hooks/useAuthContext";
import { useCreatePost } from "../hooks/useCreatePost";
import styles from "../styles/Forms.module.css";

const NewPost = () => {
    const [ body, setBody ] = useState("");

    const { createPost, isLoading, error } = useCreatePost();
    const { user } = useAuthContext();

    const navigate = useNavigate();

    const MAX_LENGTH = 512;

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createPost(body);

        if (!error) {
            navigate("/");
        }
    };

    return (
        <div className={styles.pageContainer}>
            <form onSubmit={handleSubmit} className={clsx(styles.form, styles.wideForm)}>
                <h3>Create a New Post</h3>

                <div className={styles.inputWrapper}>
                    <textarea
                        name="body" id="body"
                        placeholder="Lorem Ipsum..."
                        onChange={(e) => { setBody(e.target.value); }}
                        value={ body }
                        required
                        disabled={ isLoading }
                        maxLength={MAX_LENGTH}
                    ></textarea>

                    <div className={clsx(styles.counter, {
                        [styles.counterWarning]: body.length >= MAX_LENGTH - 20,
                        [styles.counterMax]: body.length >= MAX_LENGTH
                    })}>
                        {body.length} / {MAX_LENGTH}
                    </div>
                </div>

                { error && (
                    <p className="error">
                        <Ban size={18} />
                        { error }
                    </p>
                )}

                <div className={styles.flexContainer}>
                    <button
                        className={clsx(styles.formButton, styles.formCancelButton)}
                        type="button"
                        onClick={() => navigate("/")}
                        disabled={isLoading}
                    >
                        <XCircle size={18} />
                        Cancel
                    </button>

                    <button
                        className={styles.formButton}
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
                </div>

                <p className="small centred">Posting as: <strong>@{user.username}</strong></p>
            </form>
        </div>
    );
};

export default NewPost;
