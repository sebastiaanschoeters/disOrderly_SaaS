// ActivationPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Input, Button, Card, message, ConfigProvider } from 'antd';
import '../CSS/Ant design overide.css'
import { antThemeTokens, themes } from '../themes';

const ActivationPage = () => {
    const { activationCode } = useParams(); // Get the activation code from URL
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [theme, setTheme] = useState('blauw');
    const themeColors = themes[theme] || themes.blauw; // Get theme colors

    useEffect(() => {
        if (activationCode) {
            form.setFieldsValue({ activationKey: activationCode });
        }
    }, [activationCode, form]);

    const onFinish = (values) => {
        setLoading(true);
        message.success("This is a front-end only activation. Enter a key to simulate.");
        setLoading(false);
    };

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: themeColors.primary2,
                    color : themeColors.primary10
                }}
            >
                <Card
                    style={{
                        width: 400,
                        border: 'none',
                    }}
                    title="Account Activation"
                >
                    <Form form={form} name="activationForm" onFinish={onFinish}>
                        <Form.Item
                            label="Activation Key"
                            name="activationKey"
                            rules={[{ required: true, message: 'Please enter your activation key!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                                Activate Account
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </ConfigProvider>
    );
};

export default ActivationPage;
