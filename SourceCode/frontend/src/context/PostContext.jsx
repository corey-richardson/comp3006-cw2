import { createContext, useReducer, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuthContext } from "../hooks/useAuthContext";

export const PostContext = createContext();

export const postReducer = (state, action) => {
    switch (action.type) {
        case "SET_POSTS":
            return { posts: action.payload};
        case "ADD_POST":
            return { posts: [ action.payload, ...state.posts ] };
        default:
            return state;
    }
};

export const PostContextProvider = ({ children }) => {
    const [ state, dispatch ] = useReducer(postReducer, {
        posts: []
    });

    const { user } = useAuthContext();

    useEffect(() => {
        const fetchPosts = async () => {
            const baseUrl = process.env.REACT_APP_API_BASE_URL || "/api";
            const response = await fetch(`${baseUrl}/posts`);
            const json = await response.json();

            if (response.ok) {
                dispatch({ type: "SET_POSTS", payload: json });
            }
        }

        fetchPosts();
        
        const socket = io(process.env.REACT_APP_BASE_URL || "/", {
            query: { token: user?.token || null }
        });
        socket.on("new_post", (newPost) => {
            dispatch({ type: "ADD_POST", payload: newPost });
        });

        return () => socket.disconnect();
    }, [user]);
    
    
    return (
        <PostContext.Provider value={{ ...state, dispatch }}>
            { children }
        </PostContext.Provider>
    )
}
