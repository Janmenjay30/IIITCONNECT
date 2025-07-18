import React, { useEffect, useState } from 'react';

const ShowUser = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Replace the URL below with your actual API endpoint
        fetch('/api/users/getAllUsers') // Adjust the endpoint as needed
            .then((res) => res.json())
            .then((data) => {
                setUsers(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching users:', err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading users...</div>;

    return (
        <div>
            <h2>All Users</h2>
            {users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <ul>
                    {users.map((user) => (
                        <li key={user.id || user._id}>
                            {user.name} ({user.email})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ShowUser;