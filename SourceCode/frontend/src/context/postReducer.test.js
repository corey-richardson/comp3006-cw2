import { describe, it, expect } from "vitest";

import postReducer from "./postReducer";

describe("postReducer ADD_POST", () => {
    const initialState = {
        posts: [],
        hasMore: false,
        totalPosts: 0,
        feedtype: {
            type: "global",
            username: null
        }
    };

    const mockPost = {
        _id: "12345",
        author_id: {
            _id: "67890",
            username: "cranes-planes-migraines"
        },
        body: "Under the tree, spider and me."
    };

    it ("Adds post to state when on Global feed", () => {
        // Arrange
        const action = {
            type: "ADD_POST",
            payload: {
                ...mockPost,
                isFollowingAuthor: false
            }
        };
        // Act
        const state = postReducer(initialState, action);
        // Assert
        expect(state.posts).toHaveLength(1);
        expect(state.totalPosts).toBe(1);
    });

    it ("Doesn't add post to Following feed if isFollowingAuthor is false", () => {
        // Arrange
        const followingState = { ...initialState, feedtype: { type: "following" } };
        const action = {
            type: "ADD_POST",
            payload: {
                ...mockPost,
                isFollowingAuthor: false
            }
        };
        // Act
        const state = postReducer(followingState, action);
        // Assert
        expect(state.posts).toHaveLength(0);
    });

    it ("Add Post to Profile fed IF usernames match", () => {
        // Arrange
        const profileState = { ...initialState, feedtype: { type: "profile", username: "cranes-planes-migraines" } };
        const action = { type: "ADD_POST", payload: mockPost }; // Username: "cranes-planes-migraines"
        // Act
        const state = postReducer(profileState, action);
        // Assert
        expect(state.posts).toHaveLength(1);
    });

    it ("Dont add Post to profile feed if usernames DON'T match", () => {
        // Arrange
        const profileState = { ...initialState, feedtype: { type: "profile", username: "venusian-2" } };
        const action = { type: "ADD_POST", payload: mockPost }; // Username: "cranes-planes-migraines"
        // Act
        const state = postReducer(profileState, action);
        // Assert
        expect(state.posts).toHaveLength(0);
    });

    it ("Doesn't add duplicate post to state", () => {
        // Arrange
        const existingPost = { _id: "1234", author_id: { username: "fafyl" } };
        const initialState = {
            posts: [ existingPost ],
            totalPosts: 1,
            feedtype: { type: "global" }
        };
        const action = {
            type: "ADD_POST",
            payload: { ...existingPost, isFollowingAuthor: false }
        };
        // Act
        const newState = postReducer(initialState, action);
        // Assert
        expect(newState.posts).toHaveLength(1);
        expect(newState.totalPosts).toBe(1);
        expect(newState).toBe(initialState);
    });
});

describe("postReducer SET_POST / LOAD_MORE_POSTS Pagination", () => {
    const initialState = {
        posts: [ { _id: "old-123", body: "You taste like honey, all warm and runny." } ],
        hasMore: false,
        totalPosts: 0
    };

    it ("SET_POST replaces existing post state", () => {
        // Arrange
        const action = ({
            type: "SET_POSTS",
            payload: {
                posts: [ {  _id: "new-123", body: "Kinder than candy, effervescent candy." } ],
                hasMore: true,
                totalPosts: 10
            }
        });
        // Act
        const newState = postReducer(initialState, action);
        // Assert
        expect(newState.posts).toHaveLength(1);
        expect(newState.posts[0]._id).toBe("new-123");
        expect(newState.hasMore).toBe(true);
        expect(newState.totalPosts).toBe(10);
    });

    it ("LOAD_MORE_POSTS appends newly loaded posts to existing state", () => {
        // Arrange
        const action = ({
            type: "LOAD_MORE_POSTS",
            payload: {
                posts: [ {  _id: "new-123", body: "Kinder than candy, effervescent candy." } ],
                hasMore: false,
            }
        });
        // Act
        const newState = postReducer(initialState, action);
        // Assert
        expect(newState.posts).toHaveLength(2);
        expect(newState.posts[0]._id).toBe("old-123");
        expect(newState.posts[1]._id).toBe("new-123");
        expect(newState.hasMore).toBe(false);
    });
});

describe("postReducer UPDATE_POST", () => {
    const initialState = {
        posts: [
            { _id: "1", body: "Original Content", likes: 0 },
            { _id: "2", body: "Also Original Content", likes: 5 }
        ]
    };

    it ("Updates a post existing in state with no side effects on other posts", () => {
        // Arrange
        const updatedPost = { _id: "2", body: "Updated Content", likes: 42 };
        const action = { type: "UPDATE_POST", payload: updatedPost };
        // Act
        const newState = postReducer(initialState, action);
        // Assert
        expect(newState.posts).toHaveLength(2);
        expect(newState.posts[0].body).toBe("Original Content");
        expect(newState.posts[1].body).toBe("Updated Content");
        expect(newState.posts[1].likes).toBe(42);
    });

    it ("Should return existing state if post doesn't exist", () => {
        // Arrange
        const newPost = { _id: "3", body: "I'm not in state", likes: 666 };
        const action = { type: "UPDATE_POST", payload: newPost };
        // Act
        const newState = postReducer(initialState, action);
        // Assert
        expect(newState.posts).toHaveLength(2);
    });
});

describe("postReducer REMOVE_POST", () => {
    const initialState = {
        posts: [
            { _id: "1", body: "Keep me" },
            { _id: "2", body: "Delete me" }
        ],
        totalPosts: 2
    };

    it ("Removes a specified post and decrements totalPosts", () => {
        // Arrange
        const action = { type: "REMOVE_POST", payload: "2" };
        // Act
        const newState = postReducer(initialState, action);
        // Assert
        expect(newState.posts).toHaveLength(1);
        expect(newState.totalPosts).toBe(1);
        expect(newState.posts[0]._id).toBe("1");
    });

    it ("Has no effect if a specified post doesn't exist in state", () => {
        // Arrange
        const action = { type: "REMOVE_POST", payload: "666" };
        // Act
        const newState = postReducer(initialState, action);
        // Assert
        expect(newState.posts).toHaveLength(2);
        expect(newState.totalPosts).toBe(2);
    });

    it ("Shouldn't decrement totalPosts below 0", () => {
        // Arrange
        const impossibleEmptyState = { posts: [ { _id: "1" } ], totalPosts: 0 };
        const emptyState = { posts: [], totalPosts: 0 };
        const action = { type: "REMOVE_POST", payload: "1" };
        // Act and Assert
        const newStateImpossible = postReducer(impossibleEmptyState, action);
        expect(newStateImpossible.totalPosts).toBe(0);
        // Act and Assert
        const newStateEmpty = postReducer(emptyState, action);
        expect(newStateEmpty.totalPosts).toBe(0);
    });
});

describe("postReducer CLEAR_POSTS", () => {
    it ("Should clear state to an empty posts list and 0 total posts", () => {
        // Arrange
        const stateToClear = {
            posts: [
                { _id: "1", body: "Keep me" },
                { _id: "2", body: "Delete me" }
            ],
            totalPosts: 2,
            hasMore: true,
            feedtype: { type: "following" }
        };
        const action = { type: "CLEAR_POSTS" };
        // Act
        const newState = postReducer(stateToClear, action);
        // Assert
        expect(newState.posts).toHaveLength(0);
        expect(newState.hasMore).toBe(false);
        expect(newState.totalPosts).toBe(0);
        expect(newState.feedtype.type).toBe("global");
    });
});

describe("postReducer SET_FEEDTYPE", () => {
    it ("Updates the feedtype", () => {
        // Arrange
        const initialState = { posts: [], feedtype: { type: "global" } };
        const newFeedtype = { type: "profile", username: "eyes-like-the-sky" };
        const action = { type: "SET_FEEDTYPE", payload: newFeedtype };
        // Act
        const newState = postReducer(initialState, action);
        // Assert
        expect(newState.feedtype.type).toBe("profile");
        expect(newState.feedtype.username).toBe("eyes-like-the-sky");
    });
});

describe("postReducer default case", () => {
    it ("Should return original state if action type isn't valid", () => {
        // Arrange
        const initialState = { posts: [ { _id: "1", body: "No change please." } ] };
        const action = { type: "NOT_A_VALID_ACTION" };
        // Act
        const newState = postReducer(initialState, action);
        // Assert
        expect(newState).toBe(initialState);
    });
});
