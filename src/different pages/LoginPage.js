import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import '../CSS/AntDesignOverride.css';
import { antThemeTokens, ButterflyIcon, themes } from '../themes';
import { useNavigate } from 'react-router-dom';
import forestImage from '../Media/forest.jpg'; // Path to the image

const LoginPage = () => {
    const [theme, setTheme] = useState('default');
    const [isTransitioning, setIsTransitioning] = useState(false); // To handle transition state
    const themeColors = themes[theme] || themes.blauw;
    const navigate = useNavigate();

    // Simulate a login request (replace with your real API call)
    const handleLogin = (values) => {
        console.log('Form values:', values);
        const { email, password } = values;

        // Example of a successful login response
        const fakeLoginResponse = {
            token: 'fake-session-token',
            user: { email },
        };

        // Save user session to localStorage
        localStorage.setItem('sessionToken', fakeLoginResponse.token);
        localStorage.setItem('userEmail', fakeLoginResponse.user.email);

        // Navigate to the home page
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