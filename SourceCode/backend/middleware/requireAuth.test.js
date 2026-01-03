import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import requireAuth from "./requireAuth";

vi.mock("jsonwebtoken", () => ({
    default: {
        verify: vi.fn()
    }
}));

vi.mock("../models/userModel", () => ({
    default: {
        findById: vi.fn()
    }
}));

describe("requireAuth Middleware", () => {
    let request, response, next;

    beforeEach(() => {
        vi.clearAllMocks();

        request = { headers: {} };
        response = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };
        next = vi.fn();

        process.env.SECRET = "test_secret";
    });

    it ("Rejects if no auth header is present", async () => {
        await requireAuth(request, response, next);

        expect(response.status).toHaveBeenCalledWith(401);
        expect(response.json).toHaveBeenCalledWith({ error: "Authorization header required" });
        expect(next).not.toHaveBeenCalled();
    });

    it ("Rejects if token is invalid or expired", async () => {
        request.headers.authorization = "Bearer bad_token";
        jwt.verify.mockImplementation(() => { throw new Error("Invalid token.")});

        await requireAuth(request, response, next);

        expect(response.status).toHaveBeenCalledWith(401);
        expect(response.json).toHaveBeenCalledWith({ error: "Request not authorized." });
        expect(next).not.toHaveBeenCalled();
    });

    it ("Rejects if user doesn't exist in database", async () => {
        request.headers.authorization = "Bearer good_token";
        jwt.verify.mockReturnValue({ _id: "12345" }); // JWT has _id prop
        
        User.findById.mockReturnValue({
            select: vi.fn().mockResolvedValue(null)
        }); // But User._id not found in db

        await requireAuth(request, response, next);

        expect(response.status).toHaveBeenCalledWith(404);
        expect(response.json).toHaveBeenCalledWith({ error: "User not found." });
        expect(next).not.toHaveBeenCalled();
    });

    it ("Accepts if token is valid and user exists in db", async () => {
        request.headers.authorization = "Bearer good_token";
        jwt.verify.mockReturnValue({ _id: "12345" })

        User.findById.mockReturnValue({
            select: vi.fn().mockResolvedValue({ _id: "12345" })
        });

        await requireAuth(request, response, next);

        expect(request.user).toHaveProperty("_id", "12345");
        expect(next).toHaveBeenCalled();
    });
});
