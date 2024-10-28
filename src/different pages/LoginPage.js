// Import necessary modules
import React, {useEffect, useState} from 'react';
import { Form, Input, Button, Checkbox, Card } from 'antd';
import 'antd/dist/reset.css';
import '../CSS/Ant design overide.css'
import themes from "../themes";

const LoginPage = () => {
    const [theme, setTheme] = useState('default');

    // Apply the selected theme colors
    useEffect(() => {
        const selectedTheme = themes[theme];
        document.documentElement.style.setProperty('--color1', selectedTheme.color1);
        document.documentElement.style.setProperty('--color2', selectedTheme.color2);
        document.documentElement.style.setProperty('--color3', selectedTheme.color3);
        document.documentElement.style.setProperty('--color4', selectedTheme.color4);
        document.documentElement.style.setProperty('--color5', selectedTheme.color5);
        document.documentElement.style.setProperty('--textColorD', selectedTheme.textColorD);
        document.documentElement.style.setProperty('--textColorL', selectedTheme.textColorL);
    }, [theme]);
    return (
        <div
            className="login-container"
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}
        >
            {/* Theme selection dropdown (outside of Routes) */}
            <div style={{ padding: '10px' }}>
                <label htmlFor="theme-select">Choose a theme: </label>
                <select
                    id="theme-select"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                >
                    {Object.keys(themes).map((themeKey) => (
                        <option key={themeKey} value={themeKey}>
                            {themeKey === "default"
                                ? "Standaard"
                                : themeKey.replace(/_/g, ' ').charAt(0).toUpperCase() + themeKey.replace(/_/g, ' ').slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            <Card style={{ width: 300 }} title="Login">
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
                        <Checkbox>
                            I accept the{' '}
                            <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                                Terms and Services
                            </a>.
                        </Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                            Login
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;
