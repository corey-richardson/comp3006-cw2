import { createContext, useReducer, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

import { useAuthContext } from "../hooks/useAuthContext";

export const PostContext = createContext();

export const postReducer = (state, action) => {
    switch (action.type) {

        case "SET_POSTS":
            return {
                ...state,
                posts: action.payload.posts,
                hasMore: action.payload.hasMore,
                totalPosts: action.payload.totalPosts || 0,
            };

        case "LOAD_MORE_POSTS":
            return {
                ...state,
                posts: [ ...state.posts, ...action.payload.posts ],
                hasMore: action.payload.hasMore
            };

        case "ADD_POST":
            return state.posts.some(post => post._id === action.payload._id)
                ? state
                : {
                    ...state,
                    posts: [ action.payload, ...state.posts ],
                    totalPosts: (state.totalPosts || 0) + 1,
                };

        case "UPDATE_POST":
            {
                const exists = state.posts.find(post => post._id === action.payload._id);
                return {
                    ...state,
                    posts: exists 
                        ? state.posts.map(post => post._id === action.payload._id ? action.payload : post)
                        : [action.payload, ...state.posts]
                };
            }

        case "REMOVE_POST":
        // lexical declaration in case block, needs scope guarding for linting
        {
            const postExists = state.posts.some(post => post._id === action.payload);
            return {
                ...state,
                posts: state.posts.filter(post => post._id !== action.payload),
                totalPosts: postExists ? Math.max(0, (state.totalPosts || 0) - 1) : state.totalPosts,
            };
        }

        case "CLEAR_POSTS":
            return { posts: [], hasMore: false };

        default:
            return state;
    }
};

export const PostContextProvider = ({ children }) => {
    const [ state, dispatch ] = useReducer(postReducer, { posts: [], hasMore: false });
    const { user } = useAuthContext();

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
            dispatch({ type: "ADD_POST", payload: newPost });
        });

        socket.on("updated_post", (updatedPost) => {
            dispatch({ type: "UPDATE_POST", payload: updatedPost });
        });

        socket.on("deleted_post", (postId) => {
            dispatch({ type: "REMOVE_POST", payload: postId });
        });

        return () => socket.disconnect();
    }, [ user, socketUrl ]);

    return (
        <PostContext.Provider value={{ ...state, dispatch, deletePost, fetchPage, toggleLike }}>
            { children }
        </PostContext.Provider>
    );
};
