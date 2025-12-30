const PostCard = ({ post }) => {
    return ( 
        <div className="post-card">
            <h4>{ post.author?.username || "Anonymous" }</h4>
            <p className="post-body">{ post.body }</p>
            <p className="post-date">{ new Date(post.createdAt).toLocaleString() }</p>
        </div>
    );
}
 
export default PostCard;
