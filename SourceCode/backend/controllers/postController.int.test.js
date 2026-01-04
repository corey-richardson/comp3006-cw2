import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import request from "supertest";
import { describe, it, expect, vi } from "vitest";

import Post from "../models/postModel";
import User from "../models/userModel";
import app from "../server";

vi.mock("../models/postModel");
vi.mock("../models/userModel");

vi.mock("jsonwebtoken");

describe("Post Update (Integration)", () => {
    it ("Return 404 and block update if the current user is not the post author", async () => {
        const currentUserId = "12345";
        jwt.verify.mockReturnValue({ _id: currentUserId });
        mongoose.Types.ObjectId.isValid = vi.fn().mockReturnValue(true);

        User.findById.mockReturnValue({
            select: vi.fn().mockResolvedValue({ _id: currentUserId })
        });

        Post.findOneAndUpdate.mockReturnValue({
            populate: vi.fn().mockResolvedValue(null) // post not found
        });

        const response = await request(app)
            .patch("/api/posts/post/post-id")
            .set("Authorization", "Bearer mock-token")
            .send({ body: "Lord of Lighting shifts his gaze." });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Post not found.");

        expect(Post.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                _id: "post-id",
                author_id: currentUserId
            }),
            expect.any(Object),
            expect.any(Object)
        );
    });
});
