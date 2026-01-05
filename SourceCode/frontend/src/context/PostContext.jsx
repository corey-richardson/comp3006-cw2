import { createContext, useReducer, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

import postReducer from "./postReducer";
import { useAuthContext } from "../hooks/useAuthContext";
import { useRelationship } from "../hooks/useRelationshipContext";

export const PostContext = createContext();

export const PostContextProvider = ({ children }) => {
    const [ state, dispatch ] = useReducer(postReducer, {
        posts: [],
        hasMore: false,
        totalPosts: 0,
        feedtype: {
            type: "global",
            username: null
        }
    });

    const { user } = useAuthContext();
    const { following } = useRelationship();

    const socketUrl = process.env.REACT_APP_BASE_URL || "/";
    const baseUrl = process.env.REACT_APP_API_BASE_URL || "/api";

    /** API ACTIONS */
    const fetchPage = useCallback(async ( page, type, username = null ) => {

        let endpoint = "/posts";
        if (type === "following") {
            endpoint = "/posts/following";
        } else if (type === "profile" && username) {
            endpoint = `/posts/user/${username}`;
        }

        try {
            const response = await fetch(`${baseUrl}${endpoint}?page=${page}`, {
                headers: {
                    "Authorization": `Bearer ${user?.token}`
                }
            });

            const json = await response.json();

            if (response.ok) {
                if (page === 1) {
                    dispatch({ type: "SET_POSTS", payload: json });
                } else {
                    dispatch({ type: "LOAD_MORE_POSTS", payload: json });
                }
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Fetch error: " + error);
        }

    }, [ user?.token, baseUrl ]);

    const toggleLike = useCallback(async (postId) => {
        if (!user) return;

        try {
            const response = await fetch(`${baseUrl}/posts/post/${postId}/like`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${user?.token}`
                },
            });

            const json = await response.json();

            if (response.ok) {
                dispatch({ type: "UPDATE_POST", payload: json });
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Error liking post:", error);
        }
    }, [ user, baseUrl ]);

    const deletePost = useCallback(async (postId) => {
        if (!user) return;

        try {
            const response = await fetch(`${baseUrl}/posts/post/${postId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${user?.token}`
                },
            });

            const json = await response.json();

            if (response.ok) {
                dispatch({ type: "REMOVE_POST", payload: json });
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Error liking post:", error);
        }
    }, [ user, baseUrl ]);

    /** SOCKET LIFECYCLE */
    useEffect(() => {
        if (user === undefined) return; // Guard against initialisations

        const socket = io(socketUrl, {
            query: { token: user?.token || null }
        });

        socket.on("new_post", (newPost) => {
            const isFollowingAuthor = following.includes(String(newPost.author_id._id));
            dispatch({ type: "ADD_POST", payload: { ...newPost, isFollowingAuthor } });
        });

        socket.on("updated_post", (updatedPost) => {
            dispatch({ type: "UPDATE_POST", payload: updatedPost });
        });

        socket.on("deleted_post", (postId) => {
            dispatch({ type: "REMOVE_POST", payload: postId });
        });

        return () => socket.disconnect();
    }, [ user, socketUrl, following ]);

    return (
        <PostContext.Provider value={{ ...state, dispatch, deletePost, fetchPage, toggleLike }}>
            { children }
        </PostContext.Provider>
    );
};
