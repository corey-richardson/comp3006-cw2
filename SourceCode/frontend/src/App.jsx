import { BrowserRouter, Routes, Route, Navigate  } from "react-router-dom";

import Navbar from "./components/Navbar";
import { useAuthContext } from "./hooks/useAuthContext";
import Feed from "./pages/Feed";
import Followers from "./pages/Followers";
import Following from "./pages/Following";
import Login from "./pages/Login";
import NewPost from "./pages/NewPost";
import Post from "./pages/Post";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";

function App() {
    const { user, authIsReady } = useAuthContext();

    return (
        <div className="App">
            <BrowserRouter>
                <Navbar />
                <div className="pages">
                    { authIsReady && (
                        <Routes>

                            <Route
                                path="/"
                                element={ <Feed /> }
                            />

                            <Route
                                path="/profile/:username"
                                element={ user ? <Profile /> : <Navigate to="/login"/> }
                            />

                            <Route
                                path="/profile/:username/followers"
                                element={ <Followers /> }
                            />

                            <Route
                                path="/profile/:username/following"
                                element={ <Following /> }
                            />

                            <Route
                                path="/profile/:username/following"
                                element={ user ? <Profile /> : <Navigate to="/login"/> }
                            />

                            <Route
                                path="/post/:id"
                                element={ <Post /> }
                            />

                            <Route
                                path="/posts/new"
                                element={ user ? <NewPost /> : <Navigate to="/login"/> }
                            />

                            <Route
                                path="/login"
                                element={ !user ? <Login /> : <Navigate to="/"/> }
                            />

                            <Route
                                path="/signup"
                                element={ !user ? <Signup /> : <Navigate to="/"/> }
                            />

                        </Routes>
                    )}
                </div>
            </BrowserRouter>
        </div>
    );
}

export default App;
