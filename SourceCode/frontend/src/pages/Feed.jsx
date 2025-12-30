import { usePosts } from "../hooks/usePosts";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { Earth, NotebookPen, UserRoundCheck  } from "lucide-react";
import PostCard from "../components/PostCard";
import styles from "../styles/Feed.module.css";

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
        <div className={styles.feed}>
            <header className={styles.feedHeader}>
                <h2>Feed</h2>
            </header>

            <nav className={styles.feedTypeSelectors}>
                <button 
                    onClick={() => setFeedType("global")} 
                    className={clsx(styles.selectorItem, { [styles.active]: feedType === "global" })}
                >
                    {<Earth size={20} />} &nbsp; Global
                </button>

                <button 
                    onClick={() => setFeedType("following")}
                    className={clsx(styles.selectorItem, { [styles.active]: feedType === "following" })}
                >
                    {<UserRoundCheck size={20} />} &nbsp; Following
                </button>

                <Link to="/posts/new" className={styles.selectorItem}>
                    {<NotebookPen size={20} />} &nbsp; New Post
                </Link>
            </nav>

            <div className={styles.postList}>
                { posts && posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                ))}

                { posts && posts.length === 0 && (
                    <p className="small centred">No posts yet!</p>
                )}

                { hasMore && (
                    <button onClick={loadMore} className={styles.loadMoreButton}>
                        Load More Posts
                    </button>
                )}
            </div>
        </div>
    );
}
 
export default Feed;
