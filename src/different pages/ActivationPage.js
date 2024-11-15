// ActivationPage.js
import React, { useState, useEffect } from 'react';
import '../CSS/Ant design overide.css';
import { useNavigate, useParams } from 'react-router-dom';
import React, {useEffect, useState} from 'react';
import '../CSS/AntDesignOverride.css'
import 'antd/dist/reset.css';
import {Form, Input, Button, Card, message, ConfigProvider, DatePicker, Radio, Select, Checkbox} from 'antd';
import '../CSS/Ant design overide.css';
import { Form, Input, Button, Card, message, ConfigProvider, DatePicker } from 'antd';
import '../CSS/AntDesignOverride.css'
import { antThemeTokens, themes } from '../themes';
import { createClient } from "@supabase/supabase-js";
import CryptoJS from 'crypto-js';

const ActivationPage = () => {
    const { activationCodeLink } = useParams();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({});
    const [form] = Form.useForm();
    const [theme, setTheme] = useState('blauw');
    const themeColors = themes[theme] || themes.blauw;
    const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q");
    const navigate = useNavigate();

    useEffect(() => {
        if (activationCodeLink) {
            form.setFieldsValue({ activationKey: activationCodeLink });
        }
    }, [activationCodeLink, form]);

    const goBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const activationCode = (values) => {
        setLoading(true);
        setTimeout(() => {
            setUserData((prevData) => ({
                ...prevData,
                activationKey: values.activationKey
            }));
            setStep(2);
            setLoading(false);
        }, 1000);
    };

    const nameAndBD = (values) => {
        setUserData((prevData) => ({
            ...prevData,
            name: values.Voornaam,
            livingSituation: values.Woonsituatie,
            birthDate: values.Geboortedatum ? values.Geboortedatum.format('YYYY-MM-DD') : null,
        }));
        setStep(3);
    };

    // Handle submission of additional info (city and organization)
    const Location = (values) => {
        setUserData((prevData) => ({
            ...prevData,
            city: values.city,
            mobility: values.mobility
        }));
        setStep(4);
    };

    const Sexuality = (values) => {
        setUserData((prevData) => ({
            ...prevData,
            gender: values.gender,
            sexuality: values.sexuality,
            relationshipPreference: JSON.stringify(values.relationshipPreference), // Store as JSON
        }));
        setStep(5);
    };

    const lvlSelect = (values) => {
        setUserData((prevData) => ({
            ...prevData,
            niveau: values.niveau
        }));
        setStep(6)
        //navigate("/login");
    };

    const saveUserProfile = async () => {

        const { data, error } = await supabase.from("Profile").insert({
            ActCode: userData.activationKey,
            name: userData.name,
            livingSituation: userData.livingSituation,
            birthDate: userData.birthDate,
            location: userData.city,
            mobility: userData.mobility,
            gender: userData.gender,
            sexuality: userData.sexuality,
            lookingFor: userData.relationshipPreference,
            //NiveauA: userData.niveau,
            email: userData.email,
            password: userData.password
        });

        if (error) {
            console.error("Error saving profile data:", error.message);
        }
    };


    const EmailAndPassword = (values) => {
        // Hash the password
        //const hashedPassword = CryptoJS.SHA256(values.password).toString();

        setUserData((prevData) => ({
            ...prevData,
            email: values.email,
            password: values.password, // Store the hashed password
        }));
        console.log("User Data to Submit:", {userData});
        saveUserProfile();
        message.success("Account aangemaakt! Je kan een profiel foto toevoegen bij je profiel.");
        //navigate("/login"); // Or navigate to the next appropriate step or route
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
                    color: themeColors.primary10
                }}
            >
                <Card
                    style={{ width: 400 }}
                    title={
                        step === 1
                            ? "Vul je V(l)inder activatie code in"
                            : step === 2
                                ? "Wie ben je?"
                                : step === 3
                                    ? "Locatie"
                                    : step === 4
                                        ? "Sexualiteit"
                                        : "Beschermings niveau"
                    }
                >
                    {step === 1 && (
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
                                    Activeren
                                </Button>
                            </Form.Item>
                        </Form>
                    )}

                    {step === 2 && (
                        <Form name="accountCreationForm" onFinish={nameAndBD}>
                            <Form.Item
                                label="Voornaam"
                                name="Voornaam"
                                rules={[{ required: true, message: 'Vul uw voornaam in' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Woonsituatie"
                                name="Woonsituatie"
                                rules={[{ required: true, message: 'Selecteer een woonsituatie' }]}
                            >
                                <Select placeholder="Selecteer uw woonsituatie">
                                    <Select.Option value="bij ouders">Bij ouders</Select.Option>
                                    <Select.Option value="woont alleen">Woont alleen</Select.Option>
                                    <Select.Option value="begeleid wonen">Begeleid wonen</Select.Option>
                                    <Select.Option value="in groepsverband">In groepsverband</Select.Option>
                                    <Select.Option value="zorginstelling">Zorginstelling</Select.Option>
                                    <Select.Option value="andere">Andere</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="Geboortedatum"
                                name="Geboortedatum"
                                rules={[{ required: true, message: 'Selecteer uw geboortedatum' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" disabledDate={(current) => current && current > new Date()} />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>Volgende</Button>
                                <Button onClick={goBack} style={{ marginTop: '8px', width: '100%' }}>Terug</Button>
                            </Form.Item>
                        </Form>
                    )}

                    {step === 3 && (
                        <Form name="additionalInfoForm" onFinish={Location}>
                            <Form.Item label="Stad" name="city" rules={[{ required: true, message: 'Voer uw stad in' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item label="Kan zelfstandig verplaatsen" name="mobility" rules={[{ required: true, message: 'Selecteer uw mobiliteits optie' }]}>
                                <Select>
                                    <Select.Option value="True">Ja</Select.Option>
                                    <Select.Option value="False">Nee</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>Volgende</Button>
                                <Button onClick={goBack} style={{ marginTop: '8px', width: '100%' }}>Terug</Button>
                            </Form.Item>
                        </Form>
                    )}

                    {step === 4 && (
                        <Form name="additionalInfoForm" onFinish={Sexuality}>
                            <Form.Item label="Geslacht" name="gender" rules={[{ required: true, message: 'Selecteer uw geslacht' }]}>
                                <Select placeholder="Selecteer uw geslacht">
                                    <Select.Option value="male">Man</Select.Option>
                                    <Select.Option value="female">Vrouw</Select.Option>
                                    <Select.Option value="non binary">Non-binair</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item label="Sexualiteit" name="sexuality" rules={[{ required: true, message: 'Selecteer uw seksualiteit' }]}>
                                <Select placeholder="Selecteer uw seksualiteit">
                                    <Select.Option value="hetero">Heteroseksueel</Select.Option>
                                    <Select.Option value="homo">Homoseksueel</Select.Option>
                                    <Select.Option value="bi">Biseksueel</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Wat zoekt u?"
                                name="relationshipPreference"
                                rules={[{ required: true, message: 'Selecteer wat u zoekt' }]}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Selecteer uw voorkeur"
                                    allowClear
                                >
                                    <Select.Option value="relatie">Relatie</Select.Option>
                                    <Select.Option value="friends">Vrienden</Select.Option>
                                    <Select.Option value="intiem">Intieme ontmoetingen</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>Volgende</Button>
                                <Button onClick={goBack} style={{ marginTop: '8px', width: '100%' }}>Terug</Button>
                            </Form.Item>
                        </Form>
                    )}

                    {step === 5 && (
                        <Form name="preferenceForm" onFinish={lvlSelect}>
                            <p>Selecteer de optie die het beste past bij jou en je begeleider</p>
                            <Form.Item name="niveau" rules={[{ required: true, message: 'Selecteer een optie' }]}>
                                <Radio.Group>
                                    <Radio value="Volledige Toegang">Begeleiding heeft volledige toegang en kan alles mee volgen en profiel aanpassen.</Radio>
                                    <Radio value="Gesprekken">Begeleiding kan enkel gesprekken lezen</Radio>
                                    <Radio value="Contacten">Begeleiding kan zien met wie jij contact hebt</Radio>
                                    <Radio value="Publiek Profiel">Begeleiding kan zien wat jij op je profiel plaatst, net zoals andere gebruikers</Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>Volgende</Button>
                                <Button onClick={goBack} style={{ marginTop: '8px', width: '100%' }}>Terug</Button>
                            </Form.Item>
                        </Form>
                    )}

                    {step === 6 && (
                        <Form name="emailPasswordForm" onFinish={EmailAndPassword}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Please enter your email' },
                                    { type: 'email', message: 'Please enter a valid email' }
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Wachtwoord"
                                name="password"
                                rules={[{ required: true, message: 'Please enter your password' }]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                label="Confirm Password"
                                name="confirmPassword"
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: 'Please confirm your password' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('The passwords do not match'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password />
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
                                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>Verzenden</Button>
                                <Button onClick={goBack} style={{ marginTop: '8px', width: '100%' }}>Back</Button>
                            </Form.Item>
                        </Form>
                    )}

                </Card>
            </div>
        </ConfigProvider>
    );
};

export default ActivationPage;
