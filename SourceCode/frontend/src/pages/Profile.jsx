import { User } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import FollowButton from "../components/FollowButton";
import PostCard from "../components/PostCard";
import { useAuthContext } from "../hooks/useAuthContext";
import { usePosts } from "../hooks/usePosts";
import { useRelationship } from "../hooks/useRelationshipContext";
import postStyles from "../styles/Feed.module.css";
import styles from "../styles/Profile.module.css";

const Profile = () => {
    const { username } = useParams();

    const { user: currentUser } = useAuthContext();
    const { followerCount, followingCount, fetchProfileMetrics } = useRelationship();
    const { posts, hasMore, fetchPage, dispatch, totalPosts } = usePosts();

    const [ profile, setProfile ] = useState(null);
    const [ page, setPage ] = useState(1);

    const [ isLoading, setIsLoading ] = useState(true);
    const [ error, setError ] = useState(null);

    const baseUrl = process.env.REACT_APP_API_BASE_URL || "/api";

    useEffect(() => {
        const fetchInitialProfile = async () => {
            setIsLoading(true);
            setError(null);

            dispatch({ type: "SET_FEEDTYPE", payload: { type: "profile", username: username } });

            try {
                const user = await fetch(`${baseUrl}/users/username/${username}`);
                if (!user.ok) throw new Error("User not found.");

                const json = await user.json();

                setProfile(json);

                fetchProfileMetrics(json._id);
                fetchPage(1, "profile", username);
                setPage(1);

            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialProfile();
        // return () => dispatch({ type: "CLEAR_POSTS" });
    }, [ username, baseUrl, fetchProfileMetrics, fetchPage, dispatch ]);

    const loadMore = async () => {
        const nextPage = page + 1;
        fetchPage(nextPage, "profile", username);
        setPage(nextPage);
    };

    const isOwner = currentUser?.username === username;

    if (isLoading) return <div className="centred">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className={styles.container}>
            <header className={styles.profileHeader}>
                <div className={styles.avatar}>
                    <User size={48} />
                </div>

                <div className={styles.details}>

                    <div className={styles.nameRow}>
                        <h1>{profile?.firstName || "Anonymous"} {profile.lastName}</h1>

                        {currentUser && !isOwner && (
                            <div className={styles.followButton}>
                                <FollowButton targetUser={profile._id} size={32} />
                            </div>
                        )}
                    </div>

                    <p className={styles.handle}>@{profile.username}</p>

                    <div className={styles.metrics}>
                        {!profile ? (
                            <p className="centred">Loading metrics...</p>
                        ) : (
                            <>
                                <Link
                                    to="./following"
                                >
                                    <strong>{followingCount || 0}</strong> Following
                                </Link> |

                                <Link
                                    to="./followers"
                                >
                                    <strong>{followerCount || 0}</strong> Followers
                                </Link> |

                                <span><strong>{totalPosts || 0}</strong> Posts</span>
                            </>
                        )}
                    </div>

                </div>
            </header>

            <div className={postStyles.feed}>
                <h2>Posts</h2>
                {posts.length > 0 ? (
                    posts.map(post => <PostCard key={post._id} post={post} />)
                ) : (
                    <p className="small centred">No posts yet.</p>
                )}

                { hasMore && (
                    <button onClick={loadMore} className={postStyles.loadMoreButton}>
                        Load More Posts
                    </button>
                )}
                { !hasMore && (
                    <button className={postStyles.loadMoreButton} disabled>
                        Nothing left to load!
                    </button>
                )}
            </div>
        </div>
    );
};

export default Profile;
