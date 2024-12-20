import React, { useEffect, useState } from 'react';
import {Form, Input, Button, Card, ConfigProvider, message} from 'antd';
import 'antd/dist/reset.css';
import '../../CSS/AntDesignOverride.css';
import { antThemeTokens, ButterflyIcon, themes } from '../../Extra components/themes';
import { useNavigate } from 'react-router-dom';
import forestImage from '../../Media/forest.jpg';
import { createClient } from "@supabase/supabase-js";
import useThemeOnCSS from "../../UseHooks/useThemeOnCSS";
import { storeUserSession } from "../../Utils/sessionHelpers";
import CryptoJS from "crypto-js";

const LoginPage = () => {
    useEffect(() => {
        const timer = setTimeout( () => {
            const emailField = document.querySelector("#loginForm_email");
            if (emailField.value) {
                const email = emailField.value;
                emailUpdated(email);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const [theme, setTheme] = useState('blauw');
    const [themeToSet, setThemeToSet] = useState('blauw');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const themeColors = themes[theme] || themes.blauw;
    const navigate = useNavigate();

    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
    const supabaseSchema = process.env.REACT_APP_SUPABASE_SCHEMA;
    const supabase = createClient(supabaseUrl, supabaseKey, {db: {schema: supabaseSchema}});

    useThemeOnCSS(themeColors);

    const changeTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const emailUpdated = async (emaill) => {
        const email = emaill.toLowerCase()
        const user_data = await getUserIdByEmail(email);
        if(!user_data) {return;}
        const userId = user_data[0].user_id;
        const themeUser = await getThemeById(userId)
        setThemeToSet(themeUser);
    };

    const getThemeById = async (id) => {
        try {
            const {data, error} = await supabase
                .from('User information')
                .select('theme')
                .eq('user_id', id);

            if (error) {
                console.error('Error fetching user_id:', error.message);
                return null;
            }

            if (data.length === 0) {
                console.log('No user found with the provided email.');
                return null;
            }
            if(data[0].theme) {
                return parseString(data[0].theme);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            return null;
        }
    }

    function parseString(inputString) {
        const themeName = inputString.match(/"([^"]*)"/)[1];
        const isDarkMode = inputString.includes('true');
        return isDarkMode ? `${themeName}-donker` : themeName;
    }


    const getUserIdByEmail = async (email) => {
        try {
            const { data, error } = await supabase
                .from('Credentials')
                .select('user_id, type')
                .eq('email', email);

            if (error) {
                console.error('Error fetching user_id:', error.message);
                return null;
            }

            if (data.length === 0) {
                console.log('No user found with the provided email.');
                return null;
            }

            return data;
        } catch (err) {
            console.error('Unexpected error:', err);
            return null;
        }
    };

    const checkPassword = async (email,password) => {
        try {
            const { data, error } = await supabase
                .from('Credentials')
                .select('user_id')
                .eq('email', email)
                .eq('password', password);

            if (error) {
                console.error('Error fetching user_id:', error.message);
                return false;
            }

            if (data.length === 0) {
                console.log('No user found with the provided email.');
                return false;
            }
            return true;
        } catch (err) {
            console.error('Unexpected error:', err);
            return false;
        }
    };


    const handleLogin = async (values) => {
        const emaill = values?.email
        const password = values?.password

        const email = emaill.toLowerCase();

        if(!await checkPassword(email, CryptoJS.SHA256(password).toString())) {
            message.error("Email of wachtwoord is niet juist")
            return;
        }

        if(themeToSet){
            changeTheme(themeToSet);
        }

        const LoginResponse = {
            token: 'fake-session-token',
            user: { email },
        };

        localStorage.setItem('sessionToken', LoginResponse.token);
        localStorage.setItem('userEmail', LoginResponse.user.email);

        const user_data = await getUserIdByEmail(LoginResponse.user.email);
        const userId = user_data[0].user_id;
        const userType = user_data[0].type;

        if (userId && userType) {
            storeUserSession(userId, userType, setIsTransitioning, navigate);
        } else {
            console.error('Failed to fetch user details');
        }
    };

    const functtest = () => {
        navigate('/activatie');
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
                    type="primary"
                    onClick={functtest}
                    style={{
                        position: "fixed",
                        right: "20px",
                        top: "20px",
                        zIndex: 1000,
                        borderRadius: "12px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "1rem"
                    }}
                >
                    Activeren
                </Button>

                <Card style={{ minWidth: 300, width: '25%' }} title="Login" bordered={false}>
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
                            <Input
                                name="email"
                                onBlur={(e) => {
                                    const emailValue = e.target.value.toLowerCase();
                                    if(emailValue) {
                                        emailUpdated(emailValue)
                                    }
                                }}
                            />
                        </Form.Item>


                        <Form.Item
                            label="Wachtwoord"
                            name="password"
                            rules={[
                                { required: true, message: 'Please input your password!' },
                            ]}
                        >
                            <Input.Password
                                name="password"
                                onChange={(e) => {
                                    const emailField = document.querySelector("#loginForm_email");
                                    if(!themeToSet) {
                                        emailUpdated(emailField.value.toLowerCase())
                                    }
                                }}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                name ="submit"
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
