import React from 'react';
import { Navigate } from 'react-router-dom';

// Session Checker
const isLoggedIn = () => {
    const token = localStorage.getItem('sessionToken');
    return !!token; // Returns true if a session token exists
};

const ProtectedRoute = ({ element }) => {
    const sessionToken = sessionStorage.getItem('sessionToken'); // or localStorage if that's where you store it
    if (!sessionToken) {
        return <Navigate to="/login" replace />; // Redirect to login if no session token
    }
    return element; // Allow access to the protected route if session token exists
};


export default ProtectedRoute;
