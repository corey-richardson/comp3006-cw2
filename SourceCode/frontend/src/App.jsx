import { BrowserRouter, Routes, Route, Navigate  } from "react-router-dom";

import Navbar from "./components/Navbar";
import { useAuthContext } from "./hooks/useAuthContext";
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import NewPost from "./pages/NewPost";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";

function App() {
    const { user } = useAuthContext();

    return (
        <div className="App">
            <BrowserRouter>
                <Navbar />
                <div className="pages">
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
                </div>
            </BrowserRouter>
        </div>
    );
}

export default App;
