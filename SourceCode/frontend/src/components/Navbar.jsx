import { Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import styles from "./Navbar.module.css";

const Navbar = () => {
    const { user } = useAuthContext();
    
    return ( 
        <header className={styles.header}>
            <div className={styles.navbarContainer}>
                <h1 className={styles.title}>Social Media App</h1>
            
                <nav>
                    { user ? (
                        <div className={styles.navLinks}>
                            <Link to="/">Home Feed</Link>
                            <Link to={`/profile/${user.username}`}>{user.username}</Link>
                        </div>
                    ) : (
                        <div className={styles.navLinks}>
                            <Link to="/login">Login</Link>
                            <Link to="/login">Signup</Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
     );
}
 
export default Navbar;
