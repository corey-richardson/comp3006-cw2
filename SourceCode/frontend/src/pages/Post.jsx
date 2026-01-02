import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";

import PostCard from "../components/PostCard";

import { usePosts } from "../hooks/usePosts";

const Post = () => {
    const { id } = useParams();
    const { posts, dispatch } = usePosts();

    const [ error, setError ] = useState(null); 

    const baseUrl = process.env.REACT_APP_API_BASE_URL || "/api";

    // const post = posts?.find(p => p._id === id);
    const post = useMemo(() => {
        return (posts || []).find(p => p._id === id);
    }, [ posts, id ]);

    useEffect(() => {
        if (!post) { // fallback for page refresh or not in context
            console.log("Not found in context, fetching...");
            const fetchPost = async () => {
                try {
                    const response = await fetch(`${baseUrl}/posts/post/${id}`);
                    const json = await response.json();

                    if (!response.ok) {
                        throw new Error(response.error || "Failed to fetch post.");
                    }

                    console.log(json);
                    dispatch({ type: "UPDATE_POST", payload: json });
                } catch (error) {
                    setError(error);
                }
            };

            fetchPost();
        }
    }, [ id, post, dispatch, baseUrl ]);

    if (error) return <p className="error">{ error }</p>
    if (!post) return <p className="centred">Loading post...</p>

    return ( 
        <div className="postContainer">
            <PostCard post={post} />
        </div>
    );
}
 
export default Post;
