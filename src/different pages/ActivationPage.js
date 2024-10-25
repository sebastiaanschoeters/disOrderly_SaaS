// ActivationPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';

const ActivationPage = () => {
    const { activationCode } = useParams(); // Get the activation code from URL
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

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
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#f0f2f5',
            }}
        >
            <Card style={{ width: 400 }} title="Account Activation">
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
    );
};

export default ActivationPage;
