import { usePosts } from "../hooks/usePosts";
import PostCard from "../components/PostCard";

const Feed = () => {
    const { posts } = usePosts();
    return ( 
        <div className="feed">
            <h2>Feed</h2>

            <div className="posts-list">
                { posts && posts.map((post) => {
                    <PostCard key={post._id} post={post} />
                })}

                { posts && posts.length === 0 && (
                    <p>No posts yet!</p>
                )}
            </div>
        </div>
     );
}
 
export default Feed;
