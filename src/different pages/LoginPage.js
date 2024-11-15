import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import '../CSS/AntDesignOverride.css';
import { antThemeTokens, themes } from '../themes';
import { useNavigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import forestImage from '../Media/forest.jpg'
import '../CSS/PageTransitions.css'; // Add CSS for transition effects

const LoginPage = () => {
    const [theme, setTheme] = useState('default');
    const themeColors = themes[theme] || themes.blauw;
    const navigate = useNavigate();
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleLogin = () => {
        setIsTransitioning(true); // Start the transition effect
    };

    const handleTransitionEnd = () => {
        navigate('/home'); // Navigate after the transition completes
    };

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <CSSTransition
                in={!isTransitioning}
                timeout={500}
                classNames="fade"
                onExited={handleTransitionEnd}
            >
                <div
                    className="login-container"
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh',
                        backgroundImage:`url(${forestImage})`, // Initial background image
                        backgroundColor: themeColors.primary3, // Transition to color
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        color: themeColors.primary10,
                        position: 'relative',
                        opacity: isTransitioning ? 0 : 1, // Fade out when transitioning
                        transition: 'opacity 0.5s ease, background-color 0.5s ease',
                        zIndex: '0',
                    }}
                >
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
                            onFinish={handleLogin}
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
                                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                    Login
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </div>
            </CSSTransition>
        </ConfigProvider>
    );
};

export default LoginPage;
