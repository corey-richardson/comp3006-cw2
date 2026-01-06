
import clsx from "clsx";
import { Earth, NotebookPen, UserRoundCheck  } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import PostCard from "../components/PostCard";
import { useAuthContext } from "../hooks/useAuthContext";
import { usePosts } from "../hooks/usePosts";
import styles from "../styles/Feed.module.css";

const Feed = () => {
    const { posts, hasMore, fetchPage, dispatch } = usePosts();

    const [ page, setPage ] = useState(1);

    const { user, authIsReady } = useAuthContext();

    const [ feedType, setFeedType ] = useState(() => {
        return localStorage.getItem("previouslySelectedFeed") || null;
    });

    useEffect(() => {
        if (authIsReady) {
            const previouslySelectedFeed = localStorage.getItem("previouslySelectedFeed");

            if (user?.token && previouslySelectedFeed) {
                setFeedType(previouslySelectedFeed);
                dispatch({ type: "SET_FEEDTYPE", payload: { type: feedType } });
            } else {
                setFeedType(user?.token ? "following" : "global");
                dispatch({ type: "SET_FEEDTYPE", payload: { type: feedType } });
            }
        }
    }, [ authIsReady, feedType, user, dispatch ]);

    useEffect(() => {
        setPage(1);
        fetchPage(1, feedType);
    }, [ feedType, fetchPage ]);

    const loadMore = () => {
        const nextPage = page + 1;
        fetchPage(nextPage, feedType);
        setPage(nextPage);
    };

    const handleFeedChange = (type) => {
        dispatch({ type: "CLEAR_POSTS" });
        dispatch({ type: "SET_FEEDTYPE", payload: { type: type } });
        setFeedType(type);
        localStorage.setItem("previouslySelectedFeed", type);
    };

    return (
        <div className={styles.feed}>
            <header className={styles.feedHeader}>
                <h2>Feed</h2>
            </header>

            <nav className={styles.feedTypeSelectors}>
                <button
                    onClick={() => handleFeedChange("global")}
                    className={clsx(styles.selectorItem, { [styles.active]: feedType === "global" })}
                    aria-label="Global Feed"
                    title="Explore posts from all users"
                >
                    {<Earth size={20} />} &nbsp; Global
                </button>

                {user && (
                    <>
                        <button
                            onClick={() => handleFeedChange("following")}
                            className={clsx(styles.selectorItem, { [styles.active]: feedType === "following" })}
                            aria-label="Following Feed"
                            title="Explore posts from users you follow"
                        >
                            {<UserRoundCheck size={20} />} &nbsp; Following
                        </button>

                        <Link
                            to="/posts/new"
                            className={styles.selectorItem}
                            aria-label="New Post"
                            title="Create and upload a new post"
                        >
                            {<NotebookPen size={20} />} &nbsp; New Post
                        </Link>
                    </>
                )}
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
                { !hasMore && (
                    <button className={styles.loadMoreButton} disabled>
                        Nothing left to load!
                    </button>
                )}

            </div>
        </div>
    );
};

export default Feed;
