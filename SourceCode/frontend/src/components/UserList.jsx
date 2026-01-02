import { User } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import FollowButton from "./FollowButton";

import profileStyles from '../styles/Profile.module.css';
import listStyles from '../styles/UserList.module.css';

const UserList = ({ users, type }) => {
    const { username } = useParams();

    const title = (type === "followers")
        ? `Followers of @${ username } (${users.length})`
        : `Users who follow @${ username } (${users.length})`;

    return (
        <div className={profileStyles.container}>
            <h2 className={ listStyles.title }>{ title }</h2>

            { users && users.length > 0 ? (
                <ul className={ listStyles.list }>
                    { users.map((user) => {
                        const target = type === "followers" ? user.follower_id : user.following_id;
                        if (!target) return null;

                        return (
                            <li key={user._id} className={ listStyles.userItem }>
                                <div className={ listStyles.userCard }>
                                    <div className={` ${profileStyles.avatar} ${listStyles.avatarExtended} `}>
                                        <User size={20} />
                                    </div>

                                    <div className={ listStyles.userDetails }>
                                        <Link to={`/profile/${target.username}`}>
                                            <span className={ listStyles.fullName }>
                                                { target.firstName || "Anonymous" } { target.lastName || "" }
                                            </span>
                                            <span className={profileStyles.handle}>@{ target.username }</span>
                                        </Link>
                                    </div>

                                    <div className={ listStyles.actions }>
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