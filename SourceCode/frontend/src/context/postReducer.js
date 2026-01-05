const postReducer = (state, action) => {
    switch (action.type) {

        case "SET_POSTS":
            return {
                ...state,
                posts: action.payload.posts,
                hasMore: action.payload.hasMore,
                totalPosts: action.payload.totalPosts,
            };

        case "LOAD_MORE_POSTS":
            return {
                ...state,
                posts: [ ...state.posts, ...action.payload.posts ],
                hasMore: action.payload.hasMore
            };

        case "ADD_POST":
        {
            const { feedtype } = state;
            const { isFollowingAuthor } = action.payload;

            const isGlobal = feedtype.type === "global";
            const isFollowing = feedtype.type === "following" && isFollowingAuthor;
            const isProfileMatch = feedtype.type === "profile" && feedtype?.username === action.payload.author_id.username;

            if (isGlobal || isFollowing || isProfileMatch) {
                return state.posts.some(post => post._id === action.payload._id)
                    ? state
                    : {
                        ...state,
                        posts: [ action.payload, ...state.posts ],
                        totalPosts: (state.totalPosts || 0) + 1,
                    };
            }

            return state; // do nothing
        }

        case "UPDATE_POST":
        {
            const exists = state.posts.find(post => post._id === action.payload._id);
            if (!exists) return state;

            return {
                ...state,
                posts: state.posts.map(post =>
                    post._id === action.payload._id ? action.payload : post
                )
            };
        }

        case "REMOVE_POST":
        // lexical declaration in case block, needs scope guarding for linting
        {
            const postExists = state.posts.some(post => post._id === action.payload);
            return {
                ...state,
                posts: state.posts.filter(post => post._id !== action.payload),
                totalPosts: postExists ? Math.max(0, (state.totalPosts || 0) - 1) : state.totalPosts,
            };
        }

        case "CLEAR_POSTS":
            return {
                posts: [],
                hasMore: false,
                totalPosts: 0,
                feedtype: { type: "global" }
            };

        case "SET_FEEDTYPE":
            return {
                ...state,
                feedtype: action.payload
            };

        default:
            return state;
    }
};

export default postReducer;
