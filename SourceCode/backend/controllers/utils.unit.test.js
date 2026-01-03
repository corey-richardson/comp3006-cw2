import { describe, it, expect, vi, beforeEach } from "vitest";

import { addPostMetricsHelper } from "./utils";
import Comment from "../models/commentModel";

const POST_ID = "123456789012345678901234";

vi.mock("../models/commentModel", () => ({
    default: {
        countDocuments: vi.fn()
    }
}));

describe("addPostMetricsHelper", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Should add totalComments and totalLikes to Post objects", async () => {
        // Arrange
        Comment.countDocuments.mockResolvedValue(5);

        const mockPost = [ {
            _id: POST_ID,
            likes: [ "a", "b" ], // .length => 2 likes
            _doc: {
                body: "1273, Down to Rockefeller Street",
            }
        } ];

        // Act
        const result = await addPostMetricsHelper(mockPost);

        // Assert
        expect(result[0]).toHaveProperty("totalComments", 5);
        expect(result[0]).toHaveProperty("totalLikes", 2);
        expect(result[0].body).toBe("1273, Down to Rockefeller Street");
        expect(Comment.countDocuments).toHaveBeenCalledWith({ post_id: POST_ID });
    });

    it ("Should handle an empty likes array", async () => {
        // Arrange
        Comment.countDocuments.mockResolvedValue(0);

        const mockPost = [ {
            _id: POST_ID,
            likes: [], // .length => 0 likes
            _doc: {
                body: "1273, Down to Rockefeller Street",
            }
        } ];

        // Act
        const result = await addPostMetricsHelper(mockPost);

        // Assert
        expect(result[0]).toHaveProperty("totalComments", 0);
        expect(result[0]).toHaveProperty("totalLikes", 0);
    });

    it ("Should handle a null likes array", async () => {
        // Arrange
        Comment.countDocuments.mockResolvedValue(0);

        const mockPost = [ {
            _id: POST_ID,
            likes: null, // .length => 0 likes
            _doc: {
                body: "1273, Down to Rockefeller Street",
            }
        } ];

        // Act
        const result = await addPostMetricsHelper(mockPost);

        // Assert
        expect(result[0]).toHaveProperty("totalComments", 0);
        expect(result[0]).toHaveProperty("totalLikes", 0);
    });

    it ("Should handle empty input", async () => {
        // Arrange and Act
        const result = await addPostMetricsHelper([]);
        // Assert
        expect(result).toEqual([]);
        expect(Comment.countDocuments).not.toHaveBeenCalled();
    });

    it ("Should handle multiple posts", async () => {
        // Arrange
        Comment.countDocuments
            .mockResolvedValueOnce(1)
            .mockResolvedValueOnce(2)
            .mockResolvedValueOnce(3);

        const mockPosts = [
            { _id: "1", likes: [ "1" ], _doc: { body: "Post 1" } },
            { _id: "2", likes: [ "1", "2" ], _doc: { body: "Post 2" } },
            { _id: "3", likes: [ "1", "2", "3" ], _doc: { body: "Post 3" } },
        ];

        // Act
        const result = await addPostMetricsHelper(mockPosts);

        // Assert
        expect(result[0]).toHaveProperty("totalComments", 1);
        expect(result[0]).toHaveProperty("totalLikes", 1);
        expect(result[1]).toHaveProperty("totalComments", 2);
        expect(result[1]).toHaveProperty("totalLikes", 2);
        expect(result[2]).toHaveProperty("totalComments", 3);
        expect(result[2]).toHaveProperty("totalLikes", 3);

        expect(Comment.countDocuments).toHaveBeenCalledTimes(3);
    });
});
