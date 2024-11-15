import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import '../CSS/AntDesignOverride.css';
import { antThemeTokens, ButterflyIcon, themes } from '../themes';
import { useNavigate } from 'react-router-dom';
import forestImage from '../Media/forest.jpg'; // Path to the image

const LoginPage = () => {
    const [theme, setTheme] = useState('default');
    const [isTransitioning, setIsTransitioning] = useState(false);  // To handle transition state
    const themeColors = themes[theme] || themes.blauw;
    const navigate = useNavigate();

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div
                className="login-container"
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: themeColors.primary2, // Background color
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
                        opacity: isTransitioning ? 0 : 1, // Fade the image in/out
                        transition: 'opacity 0.5s ease', // Smooth fade transition
                        zIndex: -1,
                    }}
                ></div>

                <ButterflyIcon color="rgba(255, 255, 255, 0.2)" />

                    {/* Activate Button */}
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
                        onFinish={(values) => console.log('Form values:', values)}
                        onFinishFailed={(errorInfo) => console.log('Failed:', errorInfo)}
                    >
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, message: 'Please input your email!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: 'Please input your password!' }]}
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
                                onClick={() => {
                                    setIsTransitioning(true); // Trigger the fade-out effect
                                    setTimeout(() => {
                                        navigate('/home'); // Go to homepage after transition
                                    }, 500); // Wait for transition to complete
                                }}
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
