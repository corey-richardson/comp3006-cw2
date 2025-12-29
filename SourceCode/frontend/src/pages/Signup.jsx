import { useState } from "react";
import useSignup from "../hooks/useSignup";

import styles from "../styles/AuthForms.module.css";

const Signup = () => {

    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ confirmPassword, setConfirmPassword ] = useState("");
    const [ username, setUsername ] = useState("");
    const [ firstName, setFirstname ] = useState("");
    const [ lastName, setLastname ] = useState("");

    const { signup, error, isLoading } = useSignup();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await signup(username, email, password, confirmPassword, firstName, lastName);
    };

    return ( 
        <div className={styles.authContainer}>
            <form className={styles.authForm} onSubmit={handleSubmit}>
                <h3>Sign Up</h3>

                <label>Name:</label>
                <div className={styles.flexContainer}>
                    <input 
                        type="text" 
                        name="firstName" id="firstName"
                        onChange={(e) => { setFirstname(e.target.value)}}
                        value={firstName}
                        required
                    />
                    <input 
                        type="text" 
                        name="lastName" id="lastName"
                        onChange={(e) => { setLastname(e.target.value)}}
                        value={lastName}
                        required
                    />
                </div>

                <label htmlFor="username">Username:</label>
                <input 
                    type="text" 
                    name="username" id="username"
                    onChange={(e) => { setUsername(e.target.value)}}
                    value={username}
                    required
                />

                <label htmlFor="email">Email:</label>
                <input 
                    type="email" 
                    name="email" id="email"
                    onChange={(e) => { setEmail(e.target.value)}}
                    value={email}
                    required
                />

                <label htmlFor="password">Password:</label>
                <input 
                    type="password" 
                    name="password" id="password"
                    onChange={(e) => { setPassword(e.target.value)}}
                    value={password}
                    required
                />

                <label htmlFor="confirm-password">Confirm Password:</label>
                <input 
                    type="password" 
                    name="confirm-password" id="confirm-password"
                    onChange={(e) => { setConfirmPassword(e.target.value)}}
                    value={confirmPassword}
                    required
                />

                <button className={styles.authButton} disabled={isLoading} type="submit">
                    { isLoading ? "Signing up..." : "Sign up" }
                </button>

                { error && <p className="error">{ error }</p> }
            </form>
        </div>
    );
}
 
export default Signup;
