import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import UserList from "../components/UserList";

const Followers = () => {
    const { username } = useParams();

    const [ users, setUsers ] = useState([]);

    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);

    const baseUrl = process.env.REACT_APP_API_BASE_URL || "/api";

    useEffect(() => {
        const fetchFollowers = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`${baseUrl}/users/username/${username}/followers`);
                const json = await response.json();

                if (!response.ok) {
                    throw new Error(json.error || "Failed to load followers.");
                }

                setUsers(json);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFollowers();
    }, [ username, baseUrl ]);

    if (loading) return <div className="centred">Loading followers...</div>;
    if (error) return <div className="error">{ error }</div>;

    return (
        <div className="container">
            <UserList users={users} type="followers" />
        </div>
    );
};

export default Followers;
