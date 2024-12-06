import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { HomeOutlined } from "@ant-design/icons";

const HomeButton = ({ navigateTo }) => {
    const navigate = useNavigate();
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

    const updateScreenSize = () => {
        setIsSmallScreen(window.innerWidth <= 768);
    };

    useEffect(() => {
        window.addEventListener("resize", updateScreenSize);
        return () => window.removeEventListener("resize", updateScreenSize);
    }, []);

    const goToHome = () => {
        navigate(navigateTo);
    };

    const buttonStyle = {
        position: "fixed",
        left: "20px",
        top: "20px",
        zIndex: 1000,
        width: isSmallScreen ? "40px" : "60px", // Smaller size for small screens
        height: isSmallScreen ? "40px" : "60px", // Smaller size for small screens
        borderRadius: "12px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    };

    const iconStyle = {
        fontSize: isSmallScreen ? "1.5rem" : "2rem", // Adjust icon size
        margin: 0, // Remove any potential margin for centering
    };

    return (
        <Button
            type="primary"
            icon={<HomeOutlined style={iconStyle} />}
            onClick={goToHome}
            style={buttonStyle}
        />
    );
};

export default HomeButton;
