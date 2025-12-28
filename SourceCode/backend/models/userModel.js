const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String, // HASHED!
        required: true,
        /* unique: true // User "corey-richardson" is already using this password! */
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    profileBio: {
        type: String,
        maxLength: 128,
        default: "",
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
