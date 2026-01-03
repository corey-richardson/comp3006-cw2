import { describe, it, expect, vi, beforeEach } from "vitest";

const {
    mockUser, mockPost, mockComment, mockRelationship,
    mockBcrypt, mockJwt, mockMongoose
} = vi.hoisted(() => ({
    mockUser: {
        create: vi.fn(),
        exists: vi.fn(),
        findOne: vi.fn(),
        findById: vi.fn(),
        findByIdAndDelete: vi.fn(),
    },
    mockPost: {
        deleteMany: vi.fn(),
        updateMany: vi.fn()
    },
    mockComment: {
        deleteMany: vi.fn(),
        updateMany: vi.fn()
    },
    mockRelationship: {
        deleteMany: vi.fn(),
        countDocuments: vi.fn()
    },
    mockBcrypt: {
        genSalt: vi.fn(),
        hash: vi.fn(),
        compare: vi.fn(),
    },
    mockJwt: {
        sign: vi.fn()
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

vi.mock("../models/userModel", () => ({ default: mockUser }));
vi.mock("../models/postModel", () => ({ default: mockPost }));
vi.mock("../models/commentModel", () => ({ default: mockComment }));
vi.mock("../models/relationshipModel", () => ({ default: mockRelationship }));

vi.mock("bcrypt", () => ({ default: mockBcrypt }));
vi.mock("jsonwebtoken", () => ({ default: mockJwt }));
vi.mock("mongoose", () => ({ default: mockMongoose }));

import {
    signupUser,
    loginUser,
    deleteUser,
    getUserById,
    getUserByUsername
} from "./userController";

describe("userController (Unit)", () => {
    let request, response;

    beforeEach(() => {
        vi.clearAllMocks();

        request = { body: {}, params: {}, user: {} };
        response = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };

        process.env.SECRET = "test_secret";
    });

    // SIGN UP
    describe("signupUser() Tests", () => {

        describe("Missing Fields (expect 400)", () => {
            it ("Return 400 on missing email", async () => {
                request.body = { username: "test-user", password: "Password1!" };
                await signupUser(request, response);
                expect(response.status).toHaveBeenCalledWith(400);
            });

            it ("Return 400 on missing username", async () => {
                request.body = { email: "test@testmail.com", password: "Password1!" };
                await signupUser(request, response);
                expect(response.status).toHaveBeenCalledWith(400);
            });

            it ("Return 400 on missing password", async () => {
                request.body = { email: "test@testmail.com", username: "test-user" };
                await signupUser(request, response);
                expect(response.status).toHaveBeenCalledWith(400);
            });
        });

        describe("Invalid Formats (expect 400)", () => {
            it ("Invalid email", async () => {
                request.body = { username: "test-user", email: "not-an-email", password: "Password1!" };
                await signupUser(request, response);
                expect(response.status).toHaveBeenCalledWith(400);
                expect(response.json).toHaveBeenCalledWith({ error: "Invalid Email Address." });
            });

            it ("Invalid username (spaces)", async () => {
                request.body = { username: "test user", email: "test@testmail.com", password: "Password1!" };
                await signupUser(request, response);
                expect(response.status).toHaveBeenCalledWith(400);
                expect(response.json).toHaveBeenCalledWith({ error: "Invalid Username format." });
            });

            it ("Invalid username (short)", async () => {
                request.body = { username: "no", email: "test@testmail.com", password: "Password1!" };
                await signupUser(request, response);
                expect(response.status).toHaveBeenCalledWith(400);
                expect(response.json).toHaveBeenCalledWith({ error: "Invalid Username format." });
            });

            it ("Invalid username (long)", async () => {
                request.body = { username: "hippopotomonstrosesquipedaliaphobia", email: "test@testmail.com", password: "Password1!" };
                await signupUser(request, response);
                expect(response.status).toHaveBeenCalledWith(400);
                expect(response.json).toHaveBeenCalledWith({ error: "Invalid Username format." });
            });

            it ("Weak password", async () => {
                request.body = { username: "test-user", email: "test@testmail.com", password: "abc" };
                await signupUser(request, response);
                expect(response.status).toHaveBeenCalledWith(400);
                expect(response.json).toHaveBeenCalledWith({ error: "Password is not strong enough." });
            });
        });

        it ("Return 200 on valid request", async () => {
            request.body = { username: "test-user", email: "test@testmail.com", password: "Password1!" };

            mockUser.exists.mockResolvedValue(false);
            mockUser.create.mockResolvedValue({ _id:  "12345" });
            mockBcrypt.genSalt.mockResolvedValue("salt");
            mockBcrypt.hash.mockResolvedValue("hashed-password");
            mockJwt.sign.mockResolvedValue("jwt-token");

            await signupUser(request, response);
            expect(response.status).toHaveBeenCalledWith(200);
        });

        it ("Return 409 on username/email conflict", async () => {
            request.body = { username: "test-user", email: "test@testmail.com", password: "Password1!" };
            mockUser.exists.mockResolvedValue(true);
            await signupUser(request, response);
            expect(response.status).toHaveBeenCalledWith(409);
            expect(response.json).toHaveBeenCalledWith({ error: "Email or Username already in use." });
        });
    });

    describe("loginUser() Tests", () => {

        describe("Missing Fields (expect 400)", () => {
            it("Return 400 on missing email", async () => {
                request.body = { password: "Password1!" };
                await loginUser(request, response);

                expect(response.status).toHaveBeenCalledWith(400);
                expect(response.json).toHaveBeenCalledWith({
                    error: "Please fill in all fields.",
                    emptyFields: [ "email" ]
                });
            });

            it("Return 400 on missing password", async () => {
                request.body = { email: "test@testmail.com" };
                await loginUser(request, response);

                expect(response.status).toHaveBeenCalledWith(400);
                expect(response.json).toHaveBeenCalledWith({
                    error: "Please fill in all fields.",
                    emptyFields: [ "password" ]
                });
            });

            it("Return 400 on missing both email and password", async () => {
                request.body = {};
                await loginUser(request, response);

                expect(response.status).toHaveBeenCalledWith(400);
                expect(response.json).toHaveBeenCalledWith({
                    error: "Please fill in all fields.",
                    emptyFields: [ "email", "password" ]
                });
            });
        });

        describe("User Not Found (expect 404)", () => {
            it("Return 404 when user does not exist", async () => {
                request.body = { email: "nonexistent@testmail.com", password: "Password1!" };

                mockUser.findOne.mockResolvedValue(null);
                await loginUser(request, response);

                expect(response.status).toHaveBeenCalledWith(404);
                expect(response.json).toHaveBeenCalledWith({ error: "User not found." });
            });
        });

        describe("Incorrect Password (expect 401)", () => {
            it("Return 401 on incorrect password", async () => {
                request.body = { email: "test@testmail.com", password: "WrongPassword1!" };

                mockUser.findOne.mockResolvedValue({
                    _id: "12345",
                    email: "test@testmail.com",
                    username: "test-user",
                    password: "hashed-password"
                });
                mockBcrypt.compare.mockResolvedValue(false);

                await loginUser(request, response);

                expect(response.status).toHaveBeenCalledWith(401);
                expect(response.json).toHaveBeenCalledWith({ error: "Incorrect password." });
            });
        });

        describe("Successful Login (expect 200)", () => {
            it("Return 200 on valid credentials", async () => {
                request.body = { email: "test@testmail.com", password: "Password1!" };

                mockUser.findOne.mockResolvedValue({
                    _id: "12345",
                    email: "test@testmail.com",
                    username: "test-user",
                    password: "hashed-password"
                });
                mockBcrypt.compare.mockResolvedValue(true);
                mockJwt.sign.mockReturnValue("jwt-token");

                await loginUser(request, response);

                expect(response.status).toHaveBeenCalledWith(200);
                expect(response.json).toHaveBeenCalledWith({
                    email: "test@testmail.com",
                    username: "test-user",
                    token: "jwt-token",
                    _id: "12345"
                });
            });
        });
    });

    describe("getUserById() / getUserByUsername() Tests", () => {

        describe("getUserById() Tests", () => {
            describe("Invalid ID Format (expect 400)", () => {
                it("Return 400 on invalid ObjectId format", async () => {
                    request.params = { id: "invalid-id" };
                    mockMongoose.Types.ObjectId.isValid.mockReturnValue(false);

                    await getUserById(request, response);

                    expect(response.status).toHaveBeenCalledWith(400);
                    expect(response.json).toHaveBeenCalledWith({ error: "Invalid ID format." });
                });
            });

            describe("User Not Found (expect 404)", () => {
                it("Return 404 when user does not exist", async () => {
                    request.params = { id: "507f1f77bcf86cd799439011" };
                    mockMongoose.Types.ObjectId.isValid.mockReturnValue(true);
                    mockUser.findById.mockReturnValue({
                        select: vi.fn().mockResolvedValue(null)
                    });

                    await getUserById(request, response);

                    expect(response.status).toHaveBeenCalledWith(404);
                    expect(response.json).toHaveBeenCalledWith({ error: "User not found." });
                });
            });

            describe("Successful Retrieval (expect 200)", () => {
                it("Return 200 with user data and follower counts", async () => {
                    request.params = { id: "507f1f77bcf86cd799439011" };
                    mockMongoose.Types.ObjectId.isValid.mockReturnValue(true);

                    const mockUserData = {
                        _id: "507f1f77bcf86cd799439011",
                        username: "test-user",
                        email: "test@testmail.com",
                        firstName: "Test",
                        lastName: "User",
                        _doc: {
                            _id: "507f1f77bcf86cd799439011",
                            username: "test-user",
                            email: "test@testmail.com",
                            firstName: "Test",
                            lastName: "User"
                        }
                    };

                    mockUser.findById.mockReturnValue({
                        select: vi.fn().mockResolvedValue(mockUserData)
                    });
                    mockRelationship.countDocuments
                        .mockResolvedValueOnce(10)
                        .mockResolvedValueOnce(5);

                    await getUserById(request, response);

                    expect(response.status).toHaveBeenCalledWith(200);
                    expect(response.json).toHaveBeenCalledWith({
                        _id: "507f1f77bcf86cd799439011",
                        username: "test-user",
                        email: "test@testmail.com",
                        firstName: "Test",
                        lastName: "User",
                        followerCount: 10,
                        followingCount: 5
                    });
                });
            });
        });

        describe("getUserByUsername() Tests", () => {
            describe("User Not Found (expect 404)", () => {
                it("Return 404 when user does not exist", async () => {
                    request.params = { username: "nonexistent" };
                    mockUser.findOne.mockReturnValue({
                        select: vi.fn().mockResolvedValue(null)
                    });

                    await getUserByUsername(request, response);

                    expect(response.status).toHaveBeenCalledWith(404);
                    expect(response.json).toHaveBeenCalledWith({ error: "User not found." });
                });
            });

            describe("Successful Retrieval (expect 200)", () => {
                it("Return 200 with user data and follower counts", async () => {
                    request.params = { username: "test-user" };

                    const mockUserData = {
                        _id: "507f1f77bcf86cd799439011",
                        username: "test-user",
                        email: "test@testmail.com",
                        firstName: "Test",
                        lastName: "User",
                        _doc: {
                            _id: "507f1f77bcf86cd799439011",
                            username: "test-user",
                            email: "test@testmail.com",
                            firstName: "Test",
                            lastName: "User"
                        }
                    };

                    mockUser.findOne.mockReturnValue({
                        select: vi.fn().mockResolvedValue(mockUserData)
                    });
                    mockRelationship.countDocuments
                        .mockResolvedValueOnce(25)
                        .mockResolvedValueOnce(15);

                    await getUserByUsername(request, response);

                    expect(response.status).toHaveBeenCalledWith(200);
                    expect(response.json).toHaveBeenCalledWith({
                        _id: "507f1f77bcf86cd799439011",
                        username: "test-user",
                        email: "test@testmail.com",
                        firstName: "Test",
                        lastName: "User",
                        followerCount: 25,
                        followingCount: 15
                    });
                });
            });
        });
    });

    describe("deleteUser() Tests", () => {
        it ("Perform a cascading delete via a transaction", async () => {
            request.user = { _id: "12345" };

            const sessionScope = { session: vi.fn().mockReturnThis() };

            mockPost.deleteMany.mockReturnValue(sessionScope);
            mockComment.deleteMany.mockReturnValue(sessionScope);
            mockPost.updateMany.mockReturnValue(sessionScope);
            mockComment.updateMany.mockReturnValue(sessionScope);
            mockRelationship.deleteMany.mockReturnValue(sessionScope);

            mockUser.findByIdAndDelete.mockReturnValue({
                session: vi.fn().mockResolvedValue({ _id: "12345" })
            });

            await deleteUser(request, response);

            const session = await mockMongoose.startSession();

            expect(session.commitTransaction).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
        });
    });
});
