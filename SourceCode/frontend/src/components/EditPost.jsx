import clsx from "clsx";
import { useState } from "react";

import { useAuthContext } from "../hooks/useAuthContext";
import { usePosts } from "../hooks/usePosts";
import formStyles from "../styles/Forms.module.css";

const EditPost = ({ post, closeEdit }) => {
    const [ body, setBody ] = useState(post.body);

    const [ error, setError ] = useState(null);
    const [ isLoading, setIsLoading ] = useState(false);

    const { dispatch } = usePosts();
    const { user } = useAuthContext();

    const MAX_LENGTH = 512;
    const baseUrl = process.env.REACT_APP_API_BASE_URL || "/api";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${baseUrl}/posts/post/${post._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify({ body })
            });

            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error || "Failed to edit post.");
            }

            dispatch({ type: "UPDATE_POST", payload: json });
            closeEdit();

        } catch (error) {
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className={`${formStyles.form} ${formStyles.wideForm}`} onSubmit={handleSubmit}>
            <div className={formStyles.inputWrapper}>
                <textarea
                    name="body" id="body"
                    placeholder="Lorem Ipsum..."
                    onChange={(e) => { setBody(e.target.value); }}
                    value={ body }
                    disabled={ isLoading }
                    maxLength={MAX_LENGTH}
                    required
                    autoFocus
                ></textarea>

                <div className={clsx(formStyles.counter, {
                    [formStyles.counterWarning]: body.length >= MAX_LENGTH - 20,
                    [formStyles.counterMax]: body.length >= MAX_LENGTH
                })}>
                    {body.length} / {MAX_LENGTH}
                </div>
            </div>

            <div className={formStyles.flexContainer}>
                <button type="button" onClick={closeEdit} className={`${formStyles.formButton} ${formStyles.formCancelButton}`}>Cancel</button>
                <button type="submit" className={formStyles.formButton}>Save</button>
            </div>

            { error && (
                <p className="error">{ error.message }</p>
            )}

        </form>
    );
};

export default EditPost;
