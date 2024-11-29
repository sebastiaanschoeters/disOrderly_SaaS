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
            icon={<HomeOutlined style={{ fontSize:'2rem' }}/>}
            onClick={goToHome}
            style={{
                position: "fixed",
                left: "20px",
                top: "20px",
                zIndex: 1000,
                width: "60px",
                height: "60px",
                borderRadius: "12px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        />
    );
};

export default HomeButton;