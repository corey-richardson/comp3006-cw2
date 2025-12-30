import { useContext } from "react";
import { PostContext } from "../context/PostContext";

export const usePosts = () => {
    const context = useContext(PostContext);

    if (!context) {
        throw Error("Context was null, PostContext must be used within PostContextProvider.");
    }

    return context;
}
