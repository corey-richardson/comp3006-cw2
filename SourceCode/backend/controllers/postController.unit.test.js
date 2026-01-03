import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPost, mockUser, mockComment, mockRelationship, mockUtils, mockMongoose } = vi.hoisted(() => ({
    mockPost: {
        find: vi.fn(),
        findById: vi.fn(),
        countDocuments: vi.fn(),
        create: vi.fn(),
        findOneAndDelete: vi.fn(),
        findOneAndUpdate: vi.fn(),
        findByIdAndDelete: vi.fn()
    },
    mockUser: {
        findOne: vi.fn(),
    },
    mockComment: {
        countDocuments: vi.fn(),
        deleteMany: vi.fn(),
    },
    mockRelationship: {
        find: vi.fn(),
    },
    mockUtils: {
        addPostMetricsHelper: vi.fn()
    },
    mockMongoose: {
        startSession: vi.fn().mockResolvedValue({
            startTransaction: vi.fn(),
            commitTransaction: vi.fn(),
            abortTransaction: vi.fn(),
            endSession: vi.fn(),
        }),
        Types: { ObjectId: { isValid: vi.fn() } }
    }
}));

vi.mock("../models/postModel", () => ({ default: mockPost }));
vi.mock("../models/userModel", () => ({ default: mockUser }));
vi.mock("../models/commentModel", () => ({ default: mockComment }));
vi.mock("../models/relationshipModel", () => ({ default: mockRelationship }));

vi.mock("./utils", () => ({ addPostMetricsHelper: mockUtils.addPostMetricsHelper }));

vi.mock("mongoose", () => ({ default: mockMongoose }));

import {
    // getPosts,
    getPost,
    // getUsersPosts,
    // getFollowingPosts,
    createPost,
    // deletePost,
    updatePost,
    // likePost
} from "./postController";

describe("postController", () => {
    let request, response, mockSocket;

    beforeEach(() => {
        vi.clearAllMocks();
        mockSocket = { emit: vi.fn() }; // mocket?

        request = {
            body: {}, params: {}, query: {},
            user: { _id: "12345" },
            app: { get: vi.fn().mockReturnValue(mockSocket) } // request.app.get
        };

        response = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };
    });

    describe("createPost() Tests", () => {
        it ("Returns 400 if body is missing", async () => {
            request.body = { body: "" };
            await createPost(request, response);

            expect(response.status).toHaveBeenCalledWith(400);
        });

        it ("Creates a post and emits socket event", async () => {
            request.body = { body: "It's in vogue, to be feckless." }; // Sense, KGLW

            const mockCreatedPost = {
                _id: "12345",
                body: "It's in vogue, to be feckless.",
                populate: vi.fn().mockReturnThis()
            };

            mockPost.create.mockResolvedValue(mockCreatedPost);
            await createPost(request, response);

            expect(response.status).toHaveBeenCalledWith(201);
            expect(mockPost.create).toHaveBeenCalledWith({ author_id: "12345", body: "It's in vogue, to be feckless." });
            expect(mockSocket.emit).toHaveBeenCalledWith("new_post", mockCreatedPost);
        });
    });

    describe("getPost() Tests", () => {
        it ("Returns 400 if ID is invalid (Mongoose format)", async () => {
            request.params.id = "invalid-id";
            mockMongoose.Types.ObjectId.isValid.mockReturnValue(false);

            await getPost(request, response);
            expect(response.status).toHaveBeenCalledWith(400);
        });

        it ("Returns 404 if post not found", async () => {
            request.params.id = "i-dont-exist";
            mockMongoose.Types.ObjectId.isValid.mockReturnValue(true);

            mockPost.findById.mockReturnValue({
                populate: vi.fn().mockResolvedValue(null)
            });

            await getPost(request, response);
            expect(response.status).toHaveBeenCalledWith(404);
        });

        it ("Returns 200 with metrics when valid", async () => {
            request.params.id = "i-am-valid-and-exist";
            mockMongoose.Types.ObjectId.isValid.mockReturnValue(true);

            const mockFetchedPost = { _id: "i-am-valid-and-exist", body: "N.G, R.I. Mundane. Bloodstain" };

            mockPost.findById.mockReturnValue({
                populate: vi.fn().mockResolvedValue(mockFetchedPost)
            });

            mockUtils.addPostMetricsHelper.mockResolvedValue([
                { ...mockFetchedPost, totalComments: 5, totalLikes: 42 }
            ]);

            await getPost(request, response);

            expect(mockPost.findById).toHaveBeenCalledWith("i-am-valid-and-exist");
            expect(mockUtils.addPostMetricsHelper).toHaveBeenLastCalledWith([ mockFetchedPost ]);
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({
                _id: "i-am-valid-and-exist",
                body: "N.G, R.I. Mundane. Bloodstain",
                totalComments: 5,
                totalLikes: 42
            });
        });

        it("Returns 500 on internal error", async () => {
            request.params.id = "valid-id";
            mockMongoose.Types.ObjectId.isValid.mockReturnValue(true);

            mockPost.findById.mockImplementation(() => {
                throw new Error("Database blew up.");
            });

            await getPost(request, response);

            expect(response.status).toHaveBeenCalledWith(500);
            expect(response.json).toHaveBeenCalledWith({
                error: "Database blew up." // uh oh
            });
        });
    });

    describe("updatePost() Tests", () => {
        it ("Returns 400 if ID is invalid", async () => {
            request.params.id = "invalid-id";
            request.body = { body: "Nonagon Infinity opens the door." };

            mockMongoose.Types.ObjectId.isValid.mockReturnValue(false);

            await updatePost(request, response);

            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ error: "Invalid ID format." });
        });

        it ("Returns 404 if post not found", async () => {
            request.params.id = "i-dont-exist";
            mockMongoose.Types.ObjectId.isValid.mockReturnValue(true);

            mockPost.findOneAndUpdate.mockReturnValue({
                populate: vi.fn().mockResolvedValue(null)
            });

            await updatePost(request, response);

            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: "Post not found." });
        });

        it ("Returns 200 and emits socket event", async () => {
            request.params.id = "valid-id";
            request.body = { body: "Any wasp that I see, it's a fig wasp." };

            const updatedPost = {
                _id: "valid-id",
                body: "Any wasp that I see, it's a fig wasp.",
                author_id: "12345"
            };

            mockMongoose.Types.ObjectId.isValid.mockReturnValue(true);

            mockPost.findOneAndUpdate.mockReturnValue({
                populate: vi.fn().mockResolvedValue(updatedPost)
            });

            mockUtils.addPostMetricsHelper.mockResolvedValue([
                { ...updatedPost, totalComments: 9, totalLikes: 9 }
            ]);

            await updatePost(request, response);

            expect(mockPost.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: "valid-id", author_id: "12345" },
                { body: "Any wasp that I see, it's a fig wasp." },
                { new: true }
            );
            expect(mockUtils.addPostMetricsHelper).toHaveBeenCalledWith([ updatedPost ]);
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(updatedPost);
            expect(mockSocket.emit).toHaveBeenCalledWith("updated_post", {
                ...updatedPost, totalComments: 9, totalLikes: 9
            });

        });
    });

});
