const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

const requireAuth = async (request, response, next) => {
    const { authorization } = request.headers;
    if (!authorization) {
        return response.status(401).json({ error: "Authorization header required" });
    }

    const token = authorization.split(" ")[1];

    try {
        const { _id } = jwt.verify(token, process.env.SECRET);
        request.user = await User.findById(_id).select("_id");

        if (!request.user) {
            return response.status(404).json({ error: "User not found." });
        }

        next();

    } catch {
        return response.status(401).json({ error: "Request not authorized." });
    }

};

module.exports = requireAuth;
