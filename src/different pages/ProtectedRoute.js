import React from 'react';
import { Navigate } from 'react-router-dom';

// Session Checker
const isLoggedIn = () => {
    const token = localStorage.getItem('sessionToken');
    return !!token; // Returns true if a session token exists
};

const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn()) {
        return <Navigate to="/login" />; // Redirect to login page if not logged in
    }
    return children; // Render the protected content
};

export default ProtectedRoute;
