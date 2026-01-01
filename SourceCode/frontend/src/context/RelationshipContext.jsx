import { createContext, useReducer, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

import { useAuthContext } from "../hooks/useAuthContext";

export const RelationshipContext = createContext();

const relationshipReducer = (state, action) => {
    switch (action.type) {

        case "SET_FOLLOWING":
            return {
                ...state,
                following: action.payload.following,
                followerCount: action.payload.followerCount,
                followingCount: action.payload.followingCount,
            };

        case "UPDATE_COUNTS":
            return {
                ...state,
                followerCount: action.payload.followerCount,
                followingCount: action.payload.followingCount,
            };

        case "CLEAR_FOLLOWING":
            return {
                following: [],
                followerCount: 0,
                followingCount: 0,
            };

        case "FOLLOW":
            return { ...state, following: [ ...state.following, String(action.payload) ] };

        case "UNFOLLOW":
            return { ...state, following: state.following.filter(id => id !== String(action.payload)) };

        default:
            return state;
    }
};

export const RelationshipContextProvider = ({ children }) => {
    const [ state, dispatch ] = useReducer(relationshipReducer, {
        following: [],
        followerCount: 0,
        followingCount: 0,
    });

    const { user } = useAuthContext();

    const socketUrl = process.env.REACT_APP_BASE_URL || "/";
    const baseUrl = process.env.REACT_APP_API_BASE_URL || "/api";

    useEffect(() => {
        if (!user?._id) {
            dispatch({ type: "CLEAR_FOLLOWING" });
            return;
        };

        const fetchFollowing = async () => {
            try {
                const response = await fetch(`${baseUrl}/relationships/${user._id}/following`, {
                    headers: {
                        "Authorization": `Bearer ${user?.token}`
                    },
                });

                const json = await response.json();

                if (response.ok) {
                    const ids = json.map(f => String(f.following_id._id));
                    dispatch({ 
                        type: "SET_FOLLOWING", 
                        payload: { 
                            following: ids,
                            followerCount: user.followerCount || 0,
                            followingCount: user.followingCount || 0,
                        }
                    });
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error("Failed to fetch following list: " + error);
            }
        };

        fetchFollowing();
    }, [ user?._id, user?.token, baseUrl ]);

    const fetchProfileMetrics = useCallback(async (targetUserId) => {
        try  {
            const response = await fetch(`${baseUrl}/users/id/${targetUserId}`);
            const json = await response.json();
            if (response.ok) {
                dispatch({
                    type: "UPDATE_COUNTS",
                    payload: {
                        followerCount: json.followCount,
                        followingCount: json.followingCount,
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching follower/ing metrics: " + error);
        }
    }, [ baseUrl ]);

    const isAlreadyFollowing = useCallback((userId) => {
        if (!state.following) return false;
        return state.following.some(id => String(id) === String(userId));
    }, [ state.following ]);

    const follow = async (targetUserId) => {
        if (!user) return;

        try {
            const response = await fetch(`${baseUrl}/relationships/${targetUserId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${user?.token}`
                }
            });

            if (response.ok) {
                dispatch({ type: "FOLLOW", payload: String(targetUserId) });
            }

        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Failed to follow: " + error);
        }
    };

    const unfollow = async (targetUserId) => {
        if (!user) return;

        try {
            const response = await fetch(`${baseUrl}/relationships/${targetUserId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${user?.token}`
                }
            });

            if (response.ok) {
                dispatch({ type: "UNFOLLOW", payload: String(targetUserId) });
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Failed to follow: " + error);
        }
    };

    /** SOCKET LIFECYCLE */
    useEffect(() => {
        if (user === undefined) return;

        const socket = io(socketUrl, {
            query: { token: user?.token || null }
        });

        socket.on("relationship_update", (data) => {
            dispatch({ type: "UPDATE_COUNTS", payload: data });
        });

        return () => socket.disconnect();
    }, [ user, socketUrl ]);

    return (
        <RelationshipContext.Provider value={{ ...state, fetchProfileMetrics, follow, unfollow, isAlreadyFollowing }}>
            { children }
        </RelationshipContext.Provider>
    );
};
