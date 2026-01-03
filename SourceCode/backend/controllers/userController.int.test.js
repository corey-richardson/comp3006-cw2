import jwt from "jsonwebtoken";
import request from "supertest";
import { describe, it, expect, vi } from "vitest";

import User from "../models/userModel";
import app from "../server";

vi.mock("../models/userModel");
vi.mock("jsonwebtoken");

describe("userController (Integration)", () => {
    describe("POST /api/users/signup", () => {
        it ("Returns 400 if email is invalid", async () => {
            const response = await request(app)
                .post("/api/users/signup")
                .send({
                    username: "rattlesnake",
                    email: "not-an-email",
                    password: "Password1!",
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Invalid Email Address.");
        });

        it ("Returns 200 and a JWT Token on valid signup", async () => {
            User.exists.mockResolvedValue(false);
            User.create.mockResolvedValue({
                _id: "new_user_id",
                email: "doom@city.com",
                username: "do-do-do-doom-city"
            });
            jwt.sign.mockReturnValue("mock_token");

            const response = await request(app)
                .post("/api/users/signup")
                .send({
                    email: "doom@city.com",
                    username: "do-do-do-doom-city" ,
                    password: "Password1!"
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("token", "mock_token");
            expect(response.body.email).toBe("doom@city.com");
        });
    });

    describe("POST /api/user/login", () => {
        it.todo("LOGIN TESTS");
    });

    describe("DELETE /api/users/", () => {
        it ("Returns 401 if no Authorization header present", async () => {
            const response = await request(app)
                .delete("/api/users/id-goes-here");

            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Authorization header required");
        });
    });
});
