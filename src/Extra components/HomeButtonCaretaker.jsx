import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd"; // Using Ant Design for styling (optional)
import { HomeOutlined } from "@ant-design/icons"; // Ant Design home icon

const HomeButton = () => {
    const navigate = useNavigate();

    const goToHome = () => {
        navigate("/clientOverview"); // Adjust the route to match your home page path
    };

    return (
        <Button
            type="primary"
            shape="circle"
            icon={<HomeOutlined />}
            onClick={goToHome}
            style={{
                position: "fixed", // Optional for fixed positioning
                left: "20px",
                top: "20px",
                zIndex: 1000,
                width: "60px", // Ensures a perfect circle
                height: "60px", // Matches width
                padding: "0", // Removes extra padding
                display: "flex",
                justifyContent: "center",
                alignItems: "center", // Centers the icon
            }}
        />
    );
};

export default HomeButton;