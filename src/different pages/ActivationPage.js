// ActivationPage.js
import React, { useState } from 'react';
import { Form, Input, Button, Card, DatePicker, message } from 'antd';

const ActivationPage = () => {
    const [step, setStep] = useState(1); // Track current form step
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({}); // Store all user inputs
    const [form] = Form.useForm();

    // Handle activation code submission
    const handleActivation = (values) => {
        setLoading(true);
        setTimeout(() => {
            message.success("Activation successful!");
            setUserData((prevData) => ({
                ...prevData,
                activationKey: values.activationKey
            }));
            setStep(2); // Move to next step
            setLoading(false);
        }, 1000);
    };

    // Handle account creation submission with name and birthdate
    const handleAccountCreation = (values) => {
        setUserData((prevData) => ({
            ...prevData,
            name: values.name,
            birthDate: values.birthDate.toISOString().split('T')[0] // Format to YYYY-MM-DD
        }));
        setStep(3); // Move to next step
    };

    // Handle submission of additional info (city and organization)
    const handleAdditionalInfo = (values) => {
        setUserData((prevData) => ({
            ...prevData,
            city: values.city,
            organization: values.organization
        }));
        message.success(`Thank you, ${userData.name}! Your account setup information is complete.`);
        console.log("User Data to Submit:", userData); // For debugging
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
            <Card
                style={{ width: 400 }}
                title={
                    step === 1
                        ? "Account Activation"
                        : step === 2
                            ? "Complete Your Account"
                            : "Additional Information"
                }
            >
                {step === 1 && (
                    // Activation form
                    <Form form={form} name="activationForm" onFinish={handleActivation}>
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
                )}

                {step === 2 && (
                    // Account creation form with name and birthdate
                    <Form name="accountCreationForm" onFinish={handleAccountCreation}>
                        <Form.Item
                            label="Name"
                            name="name"
                            rules={[{ required: true, message: 'Please enter your name!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Birth Date"
                            name="birthDate"
                            rules={[{ required: true, message: 'Please select your birth date!' }]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                format="YYYY-MM-DD"
                                disabledDate={(current) => current && current > new Date()}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                Next
                            </Button>
                        </Form.Item>
                    </Form>
                )}

                {step === 3 && (
                    // Additional info form with city and organization
                    <Form name="additionalInfoForm" onFinish={handleAdditionalInfo}>
                        <Form.Item
                            label="City"
                            name="city"
                            rules={[{ required: true, message: 'Please enter your city!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Organization"
                            name="organization"
                            rules={[{ required: true, message: 'Please enter your organization!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                Complete Setup
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </Card>
        </div>
    );
};

export default ActivationPage;
