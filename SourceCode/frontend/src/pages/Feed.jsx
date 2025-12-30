import { usePosts } from "../hooks/usePosts";
import { useState, useEffect } from "react";
import PostCard from "../components/PostCard";

const Feed = () => {
    const { posts, hasMore, fetchPage } = usePosts();

    const [ page, setPage ] = useState(1);
    const [ feedType, setFeedType ] = useState("global");

    useEffect(() => {
        setPage(1);
        fetchPage(1, feedType);
    }, [feedType, fetchPage]);

    const loadMore = () => {
        const nextPage = page + 1;
        fetchPage(nextPage, feedType);
        setPage(nextPage);        
    }

    return ( 
        <div className="feed">
            <h2>Feed</h2>

            <nav className="feed-types-selectors">
                <button onClick={() => setFeedType("global")}>Global</button>
                <button onClick={() => setFeedType("following")}>Following</button>
            </nav>

            <div className="posts-list">
                { posts && posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                ))}

                { posts && posts.length === 0 && (
                    <p>No posts yet!</p>
                )}

                { hasMore && (
                    <button onClick={loadMore} className="load-more-button">
                        Load More Posts
                    </button>
                )}
            </div>
        </div>
     );
}
 
export default Feed;
