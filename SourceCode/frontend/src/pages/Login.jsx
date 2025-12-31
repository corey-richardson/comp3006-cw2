import { useState } from "react";
import useLogin from "../hooks/useLogin";

import styles from "../styles/AuthForms.module.css";

const Login = () => {

    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");

    const { login, error, isLoading } = useLogin();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(email, password);
    };

    return (
        <div className={styles.authContainer}>
            <form className={styles.authForm} onSubmit={handleSubmit}>
                <h3>Login</h3>

                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    name="email" id="email"
                    onChange={(e) => { setEmail(e.target.value);}}
                    value={email}
                    required
                />

                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    name="password" id="password"
                    onChange={(e) => { setPassword(e.target.value);}}
                    value={password}
                    required
                />

                <button className={styles.authButton} disabled={isLoading} type="submit">
                    { isLoading ? "Logging in..." : "Login" }
                </button>

                { error && <p className="error">{ error }</p> }
            </form>
        </div>
    );
};

export default Login;
