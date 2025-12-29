import { Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import useLogout from "../hooks/useLogout";

import styles from "./Navbar.module.css";

const Navbar = () => {
    const { user } = useAuthContext();
    const { logout } = useLogout();
    
    return ( 
        <header className={styles.header}>
            <div className={styles.navbarContainer}>
                <h1 className={styles.title}>Social Media App</h1>
            
                <nav className={styles.navLinks}>
                    { user ? (
                        <>
                            <Link className={styles.navItem} to="/">Home Feed</Link>
                            <Link className={styles.navItem} to={`/profile/${user.username}`}>{user.username}</Link>

                            <button className={styles.navItem} onClick={logout}>
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link className={styles.navItem} to="/login">Login</Link>
                            <Link className={styles.navItem} to="/signup">Signup</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
     );
}
 
export default Navbar;
