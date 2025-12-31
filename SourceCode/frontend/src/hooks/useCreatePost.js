import { useState } from "react";

import { useAuthContext } from "./useAuthContext";
import { usePosts } from "./usePosts";

export const useCreatePost = () => {
    const [ error, setError ] = useState();
    const [ isLoading, setIsLoading ] = useState();

    const { dispatch } = usePosts();
    const { user } = useAuthContext();

    const createPost = async (body) => {
        if (!user) {
            setError("You must be logged in!");
            return;
        }

        setIsLoading(true);
        setError(null);

        const baseUrl = process.env.REACT_APP_API_BASE_URL || "/api";

        try {
            const response = await fetch(`${baseUrl}/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify({ body })
            });

            const json = await response.json();

            if (!response.ok) {
                setIsLoading(false);
                setError(json.error);
                return;
            }

            dispatch({ type: "ADD_POST", payload: json });
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return { createPost, isLoading, error };
};
