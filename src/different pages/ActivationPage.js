// ActivationPage.js
import React, {useEffect, useState} from 'react';
import '../CSS/AntDesignOverride.css'
import 'antd/dist/reset.css';
import { Form, Input, Button, Card, message, ConfigProvider, DatePicker } from 'antd';
import '../CSS/AntDesignOverride.css'
import { antThemeTokens, themes } from '../themes';

const ActivationPage = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({});
    const [form] = Form.useForm();
    const [theme, setTheme] = useState('blauw');
    const themeColors = themes[theme] || themes.blauw; // Get theme colors
    // Apply the selected theme colors

    // Handle activation code submission
    const activationCode = (values) => {
        //NEED EXPANDING WHEN DATABASE IS IMPLEMENTED? WE NEED ACTIVATION KEY LOOKUP IF VALID
        //if valid do this if not valid write new code
        setLoading(true);
        setTimeout(() => {
            //message.success("Activation successful!");
            setUserData((prevData) => ({
                ...prevData,
                activationKey: values.activationKey
            }));
            setStep(2); // Move to next step
            setLoading(false);
        }, 1000);
    };

    const nameAndBD = (values) => {
        setUserData((prevData) => ({
            ...prevData,
            name: values.Voornaam,
            lastname: values.Achternaam,
            birthDate: values.Geboortedatum ? values.Geboortedatum.format('YYYY-MM-DD') : null
        }));
        setStep(3);
    };

    // Handle submission of additional info (city and organization)
    const Location = (values) => {
        setUserData((prevData) => ({
            ...prevData,
            city: values.city,
            organization: values.organization
        }));
        message.success(`Thank you, ${userData.name}! Your account setup information is complete.`);
        console.log("User Data to Submit:", userData); // For debugging
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
                style={{ width: 400 }}
                title={
                    step === 1
                        ? "Vul je V(l)inder activatie code in"
                        : step === 2
                            ? "stap2/4"
                            : step === 3
                                ? ""
                                : "Additional Information"
                }
            >
                {step === 1 && (
                    // Activation form
                    <Form form={form} name="activationForm" onFinish={activationCode}>
                        <Form.Item
                            label="Activation Key"
                            name="activationKey"
                            rules={[{ required: true, message: 'Dit is geen geldige activatie sleutel' }]}
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
                    <Form name="accountCreationForm" onFinish={nameAndBD}>
                        <Form.Item
                            label="Voornaam"
                            name="Voornaam"
                            rules={[{ required: true, message: 'Vul uw voornaam in' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Achternaam"
                            name="Achternaam"
                            rules={[{ required: true, message: 'Vul uw achternaam in' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Geboortedatum"
                            name="Geboortedatum"
                            rules={[{ required: true, message: 'Selecteer uw geboortedatum' }]}
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
                    <Form name="additionalInfoForm" onFinish={Location}>
                        <Form.Item
                            label="Stad"
                            name="stad"
                            rules={[{ required: true, message: 'Voer uw stad in' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Organisatie"
                            name="Organisatie"
                            rules={[{ required: true, message: 'Selecteer een organisatie' }]}
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
        </ConfigProvider>
    );
};

export default ActivationPage;
