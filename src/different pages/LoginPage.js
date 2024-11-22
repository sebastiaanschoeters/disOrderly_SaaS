import React, { useState } from 'react';
import {Form, Input, Button, Checkbox, Card, ConfigProvider, message} from 'antd';
import 'antd/dist/reset.css';
import '../CSS/AntDesignOverride.css';
import { antThemeTokens, ButterflyIcon, themes } from '../themes';
import { useNavigate } from 'react-router-dom';
import forestImage from '../Media/forest.jpg';
import {createClient} from "@supabase/supabase-js";
import CryptoJS from "crypto-js"; // Path to the image

const LoginPage = () => {
    const [theme, setTheme] = useState('default');
    const [isTransitioning, setIsTransitioning] = useState(false); // To handle transition state
    const themeColors = themes[theme] || themes.blauw;
    const navigate = useNavigate();
    const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q");

    const getUserIdByEmail = async (email,password) => {
        try {
            const { data, error } = await supabase
                .from('Credentials')
                .select('password')
                .eq('email', email)
                //.eq('password', password);
            if (error) {
                console.error('Error fetching user_id:', error.message);
                return;
            }

            if (data.length === 0) {
                console.log('No user found with the provided email.');
                return;
            }

            console.log('Fetched user_id:', data[0].user_id);
            return data[0].user_id.toString(); // Ensure it's a string
        } catch (err) {
            console.error('Unexpected error:', err);
            return null;
        }
    };

    const getPfp = async (user_id) => {
        try {
            const { data, error } = await supabase
                .from('User')
                .select('profile_picture')
                .eq('id', user_id);

            if (error) {
                console.error('Error fetching user_id:', error.message);
                return null;
            }

            if (data.length === 0) {
                console.log('No user found with the provided email.');
                return null;
            }

            console.log('Fetched user_id:', data[0].profile_picture);
            return data[0].profile_picture.toString(); // Ensure it's a string
        } catch (err) {
            console.error('Unexpected error:', err);
            return null;
        }
    };

    const getName = async (user_id) => {
        try {
            const { data, error } = await supabase
                .from('User')
                .select('name')
                .eq('id', user_id);

            if (error) {
                console.error('Error fetching user_id:', error.message);
                return null;
            }

            if (data.length === 0) {
                console.log('No user found with the provided email.');
                return null;
            }

            console.log('Fetched theme:', data[0].name);
            return data[0].name.toString(); // Ensure it's a string
        } catch (err) {
            console.error('Unexpected error:', err);
            return null;
        }
    };

    const getTheme = async (user_id, setTheme) => {
        try {
            const { data, error } = await supabase
                .from('User information')
                .select('theme')
                .eq('user_id', user_id);

            if (error) {
                console.error('Error fetching user theme:', error.message);
                return false;
            }

            if (data.length === 0) {
                console.log('No user found with the provided user ID.');
                return false;
            }

            const fetchedTheme = data[0].theme.toString(); // Ensure it's a string
            console.log('Fetched theme:', fetchedTheme);

            // Update the theme state
            setTheme(fetchedTheme);
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    };

    const handleLogin = async (values) => {
        const { email, password } = values;
        const fakeLoginResponse = {
            token: 'fake-session-token',
            user: { email },
        };

        // Save user session to localStorage
        localStorage.setItem('sessionToken', fakeLoginResponse.token);
        localStorage.setItem('userEmail', fakeLoginResponse.user.email);

        // Fetch the user ID asynchronously and store it in localStorage
        const userId = await getUserIdByEmail(fakeLoginResponse.user.email, );
        const theme = await getTheme(userId);
        const name = await getName(userId);
        const pfp = await getPfp(userId);

        if (userId) {
            localStorage.setItem('user_id', userId);
            console.log('Fetched and stored user_id:', userId);
        } else {
            console.error('Failed to fetch user_id');
        }

        if (theme) {
            localStorage.setItem('theme', theme);
            console.log('Fetched and stored theme:', theme);
        } else {
            console.error('Failed to fetch theme',);
        }

        if (name) {
            localStorage.setItem('name', name);
            console.log('Fetched and stored theme:', name);
        } else {
            console.error('Failed to fetch theme',);
        }

        if (pfp) {
            localStorage.setItem('profile_picture', pfp);
            console.log('Fetched and stored theme:', pfp);
        } else {
            console.error('Failed to fetch theme',);
        }

        // Navigate to the home page after resolving all async operations
        setIsTransitioning(true);
        setTimeout(() => navigate('/home'), 500);
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
                    type="link"
                    style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        fontWeight: 'bold',
                        color: themeColors.primary6,
                    }}
                    onClick={() => navigate('/activate')}
                >
                    Activate
                </Button>

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

                        <Form.Item name="remember" valuePropName="checked">
                            <Checkbox>Remember me</Checkbox>
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