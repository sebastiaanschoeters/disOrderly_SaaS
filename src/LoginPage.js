// Import necessary modules
import React, { useEffect } from 'react';
import { Form, Input, Button, Checkbox, Card } from 'antd';
import 'antd/dist/reset.css'; // Import Ant Design styles

const LoginPage = () => {
    return (
        <div
            className="login-container"
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#f0f2f5',
            }}
        >
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
