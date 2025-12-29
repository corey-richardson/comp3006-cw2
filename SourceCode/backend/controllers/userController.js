const mongoose = require("mongoose");

const Comment = require("../models/commentModel");
const Post = require("../models/postModel");
const Relationship = require("../models/relationshipModel");
const User = require("../models/userModel");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validator = require("validator");

const createJwt = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
}


const signupUser = async (request, response) => {
    const { username, email, password, firstName, lastName } = request.body;

    try {
        let emptyFields = [];
        if (!username) emptyFields.push("username");
        if (!email) emptyFields.push("email");
        if (!password) emptyFields.push("password");
        if (emptyFields.length > 0)
            return response.status(400).json({ error: "Please fill in all fields.", emptyFields });

        if (!validator.isEmail(email))
            return response.status(400).json({ error: "Invalid Email Address." });
        if (!validator.isSlug(username))
            return response.status(400).json({ error: "Invalid Username format." });
        if (!validator.isStrongPassword(password))
            return response.status(400).json({ error: "Password is not strong enough." });

        if (await User.exists({ $or: [{ email }, { username }] })) {
            return response.status(409).json({ error: "Email or Username already in use." });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        
        const user = await User.create({
            email,
            username,
            firstName,
            lastName,
            password: hash,
        });

        const token = createJwt(user._id);
        response.status(200).json({ email, username, token });
    } catch (e) {
        response.status(500).json({ error: e.message });
    }
}


const loginUser = async (request, response) => {
    const { email, password } = request.body;
    
    try {
        let emptyFields = [];
        if (!email) emptyFields.push("email");
        if (!password) emptyFields.push("password");
        if (emptyFields.length > 0)
            return response.status(400).json({ error: "Please fill in all fields.", emptyFields });

        const user = await User.findOne({ email });
        if (!user) {
            return response.status(404).json({ error: "User not found." });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return response.status(401).json({ error: "Incorrect password." });
        }

        const token = createJwt(user._id);
        response.status(200).json({ email, username: user.username, token });
    } catch (e) {
        response.status(500).json({ error: e.message });
    }
}


const deleteUser = async (request, response) => {
    // Delete User -> Posts/Comments CASCADE
    // Transaction?
    const userId = request.user._id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await Post.deleteMany({ author_id: userId }).session(session);
        await Comment.deleteMany({ author_id: userId }).session(session);
        await Post.updateMany({}, { $pull: { likes: userId } }).session(session);
        await Comment.updateMany({}, { $pull: { likes: userId } }).session(session);
        await Relationship.deleteMany({ 
            $or: [{ follower_id: userId}, { following_id: userId 
        }]}).session(session);

        const user = await User.findByIdAndDelete(userId).session(session);
        if (!user) {
            return response.status(404).json({ error: "User not found." });
        }

        await session.commitTransaction();
        session.endSession();
        response.status(200).json({ message: "Account and linked data deleted." });
    } catch (e) {
        await session.abortTransaction();
        session.endSession();
        response.status(500).json({ error: e.message });
    }
}


const getUserById = async (request, response) => {
    const { id } = request.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return response.status(400).json({error: "Invalid ID format."});
    }

    try {
        // Exclude password from response
        // https://mongoosejs.com/docs/api/query.html#Query.prototype.select()
        const user = await User.findById(id).select("-password");
        if (!user) {
            return response.status(404).json({ error: "User not found." });
        }

        response.status(200).json(user);
    } catch (e) {
        response.status(500).json({ error: e.message });
    }
}


const getUserByUsername = async (request, response) => {
    const { username } = request.params;

    try {
        // Exclude password from response
        // https://mongoosejs.com/docs/api/query.html#Query.prototype.select()
        const user = await User.findOne({ username }).select("-password");
        if (!user) {
            return response.status(404).json({ error: "User not found." });
        }

        response.status(200).json(user);
    } catch (e) {
        response.status(500).json({ error: e.message });
    }
}


module.exports = { loginUser, signupUser, deleteUser, getUserById, getUserByUsername };
