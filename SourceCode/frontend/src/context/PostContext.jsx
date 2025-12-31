import { createContext, useReducer, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

import { useAuthContext } from "../hooks/useAuthContext";

export const PostContext = createContext();

export const postReducer = (state, action) => {
    switch (action.type) {
        case "SET_POSTS":
            return {
                posts: action.payload.posts,
                hasMore: action.payload.hasMore
            };
        case "LOAD_MORE_POSTS":
            return {
                posts: [ ...state.posts, ...action.payload.posts ],
                hasMore: action.payload.hasMore
            };
        case "ADD_POST":
        {
            const exists = state.posts.some(p => p._id === action.payload._id);
            if (exists) return state;
            return { ...state, posts: [ action.payload, ...state.posts ] };
        }
        case "CLEAR_POSTS":
            return { posts: [], hasMore: false };
        default:
            return state;
    }
};

export const PostContextProvider = ({ children }) => {
    const [ state, dispatch ] = useReducer(postReducer, {
        posts: [],
        hasMore: false
    });

    const { user } = useAuthContext();

    const fetchPage = useCallback(async ( page, type ) => {
        const baseUrl = process.env.REACT_APP_API_BASE_URL || "/api";
        const endpoint = type === "following" ? "/posts/following" : "/posts";

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
    }, [ user?.token ]);

    useEffect(() => {
        if (user === undefined) return; // Guard against initialisations

        const socket = io(process.env.REACT_APP_BASE_URL || "/", {
            query: { token: user?.token || null }
        });
        socket.on("new_post", (newPost) => {
            dispatch({ type: "ADD_POST", payload: newPost });
        });

        return () => socket.disconnect();
    }, [ user ]);

    return (
        <PostContext.Provider value={{ ...state, dispatch, fetchPage }}>
            { children }
        </PostContext.Provider>
    );
};
