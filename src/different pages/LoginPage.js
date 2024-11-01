// Import necessary modules
import React, {useEffect, useState} from 'react';
import {Form, Input, Button, Checkbox, Card, ConfigProvider} from 'antd';
import 'antd/dist/reset.css';
import '../CSS/Ant design overide.css'
import { antThemeTokens, themes } from '../themes';

const LoginPage = () => {
    const [theme, setTheme] = useState('default');
    const themeColors = themes[theme] || themes.default;

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
                color : themeColors.primary10
            }}
        >

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
        </ConfigProvider>
    );
};

export default LoginPage;
