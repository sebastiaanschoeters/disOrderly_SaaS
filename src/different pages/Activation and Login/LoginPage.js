import React, {useEffect, useState} from 'react';
import { Form, Input, Button, Card, ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import '../../CSS/AntDesignOverride.css';
import { antThemeTokens, ButterflyIcon, themes} from '../../Extra components/themes';
import { useNavigate } from 'react-router-dom';
import forestImage from '../../Media/forest.jpg';
import {createClient} from "@supabase/supabase-js";
import useThemeOnCSS from "../../UseHooks/useThemeOnCSS";
import {storeUserSession} from "../../Utils/sessionHelpers"; // Path to the image


const LoginPage = () => {
    const theme = 'blauw'
    const [isTransitioning, setIsTransitioning] = useState(false); // To handle transition state
    const themeColors = themes[theme] || themes.blauw;
    const navigate = useNavigate();
    const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q");

    useThemeOnCSS(themeColors);

    const getUserIdByEmail = async (email) => {
        try {
            const { data, error } = await supabase
                .from('Credentials')
                .select('user_id, type')
                .eq('email', email)

            if (error) {
                console.error('Error fetching user_id:', error.message);
                return null;
            }

            if (data.length === 0) {
                console.log('No user found with the provided email.');
                return null;
            }

            console.log('Fetched dataaaaaa:', data);
            return data;
        } catch (err) {
            console.error('Unexpected error:', err);
            return null;
        }
    };

    const handleLogin = async (values) => {
        const { email, password } = values;

        // Simulate a successful login response
        const LoginResponse = {
            token: 'fake-session-token',
            user: { email },
        };

        // Save user session to localStorage
        localStorage.setItem('sessionToken', LoginResponse.token);
        localStorage.setItem('userEmail', LoginResponse.user.email);

        const user_data = await getUserIdByEmail(LoginResponse.user.email);
        const userId = user_data[0].user_id;
        const userType = user_data[0].type;

        // Call the helper function with `setIsTransitioning` passed in
        if (userId && userType) {
            storeUserSession(userId, userType, setIsTransitioning, navigate);
        } else {
            console.error('Failed to fetch user details');
        }
    };

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div
                className="login-container"
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: themeColors.primary2,
                    color: themeColors.primary10,
                    position: 'relative',
                    zIndex: 0,
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url(${forestImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: isTransitioning ? 0 : 1,
                        transition: 'opacity 0.5s ease',
                        zIndex: -1,
                    }}
                ></div>
                <ButterflyIcon color="rgba(255, 255, 255, 0.2)" />
                <Button
                    type="primary"
                    onClick={() =>navigate('/activate')}
                    style={{
                        position: "fixed",
                        right: "20px",
                        top: "20px",
                        zIndex: 1000,
                        borderRadius: "12px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "1rem"
                    }}
                >Activate</Button>

                <Card style={{ width: 300 }} title="Login" bordered={false}>
                    <Form
                        name="loginForm"
                        initialValues={{ remember: true }}
                        onFinish={handleLogin}
                        onFinishFailed={(errorInfo) =>
                            console.log('Failed:', errorInfo)
                        }
                    >
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Please input your email!' },
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[
                                { required: true, message: 'Please input your password!' },
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{ width: '100%' }}
                            >
                                Login
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </ConfigProvider>
    );
};

export default LoginPage;