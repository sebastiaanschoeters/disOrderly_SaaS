import React from "react";
import { Navigate } from "react-router-dom";
import {message} from "antd";

const isLoggedIn = () => {
    const token = localStorage.getItem("sessionToken");
    return !!token;
};


const getUserRole = () => {
    return localStorage.getItem("userType");
};

const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isLoggedIn()) {
        localStorage.clear();
        return <Navigate to="/login" />;
    }

    const userRole = getUserRole();

    if (!allowedRoles.includes(userRole)) {
        localStorage.clear();
        message.error("U hebt geen toegang tot deze pagina")
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
