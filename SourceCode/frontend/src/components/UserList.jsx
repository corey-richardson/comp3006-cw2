import { User } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import FollowButton from "./FollowButton";

const UserList = ({ users, type }) => {
    const { username } = useParams();

    const title = (type === "followers")
        ? `Followers of @${ username } (${users.length})`
        : `Users who follow @${ username } (${users.length})`;

    return (
        <div className="listContainer">
            <h2>{ title }</h2>

            { users && users.length > 0 ? (
                <ul className="list">
                    { users.map((user) => {
                        const target = type === "followers" ? user.follower_id : user.following_id;
                        if (!target) return null;

                        return (
                            <li key={user._id} className="userItem">
                                <div className="userCard">
                                    <div className="avatar">
                                        <User size={20} />
                                    </div>

                                    <div className="userDetails">
                                        <Link to={`/profile/${target.username}`}>
                                            <span className="fullName">
                                                { target.firstName || "Anonymous" } { target.lastName || "" }
                                            </span>
                                            <span className="handle">@{ target.username }</span>
                                        </Link>
                                    </div>

                                    <div className="actions">
                                        <FollowButton targetUser={target._id} size={24} />
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="centred">No users found.</p>
            )}
        </div>
    );
};

export default UserList;
