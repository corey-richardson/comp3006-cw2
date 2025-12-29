require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const http = require("http");
const { Server } = require("socket.io");

const commentRoutes = require("./routes/comments");
const postRoutes = require("./routes/posts");
const relationshipRoutes = require("./routes/relationships");
const userRoutes = require("./routes/users");

// Express App
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Middleware
app.use(express.json())
app.set("socketio", io);

app.use((request, response, next) => {
    console.log(request.path, request.method);
    next();
});

// Smoke Test Route
app.get("/api/smoke-test", (request, response) => {
    // mongoose.disconnect();
    const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
    response.json({
        express: "Online!",
        database: dbStatus
    });
});

// Routes
app.use("/api/posts/:postId/comments", commentRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/relationships", relationshipRoutes)
app.use("/api/users", userRoutes);

// Database
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        // Listen for requests, only AFTER database connection established
        server.listen(process.env.PORT, () => {
            console.log(`Connected to database and listening on Port ${process.env.PORT}!`)
        });
    })
    .catch((error) => {
        console.error(error);
    });
