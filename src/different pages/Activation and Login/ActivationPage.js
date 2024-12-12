// ActivationPage.js
import {useNavigate, useParams} from 'react-router-dom';
import React, {useEffect, useState} from 'react';
import * as dayjs from 'dayjs'
import '../../CSS/AntDesignOverride.css'
import '../../CSS/ActivationPage.css'
import 'antd/dist/reset.css';
import {Form, Input, Button, Card, message, ConfigProvider, DatePicker, Radio, Select, Checkbox, Divider} from 'antd';
import {antThemeTokens, ButterflyIcon, themes} from '../../Extra components/themes';
import { createClient } from "@supabase/supabase-js";
import CryptoJS from 'crypto-js';
import useLocations from "../../UseHooks/useLocations";
import useThemeOnCSS from "../../UseHooks/useThemeOnCSS";
import forestImage from '../../Media/forest.jpg';


const ActivationPage = () => {
    const { activationCodeLink } = useParams();
    const [searchValue, setSearchValue] = useState(""); // For search functionality
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({});
    const [form] = Form.useForm();
    const [userType, setUserType] = useState('');
    const navigate = useNavigate();

    const theme = 'blauw'
    const themeColors = themes[theme] || themes.blauw;

    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    useThemeOnCSS(themeColors);

    useEffect(() => {
        if (activationCodeLink) {
            form.setFieldsValue({ activationKey: activationCodeLink });
        }
    }, [activationCodeLink, form]);

    const {locations } = useLocations(searchValue);

    const handleSearch = (value) => {
        setSearchValue(value); // Trigger new fetch based on search
    };

    const goBack = () => {
        console.log()
        if (7> step && step > 2){
            setStep(step - 1);
        }
        else if(step === 7) {
            setStep(1);
        }
        else if(step === 2){
            setStep(1);
            setUserData(prevUserData => ({
                activationCode: prevUserData.activationCode
            }));
        }
    };

    const activationCode = async (values) => {
        setLoading(true);
        try {
            // Query the "Activation" table to validate the code
            const { data, error } = await supabase
                .from("Activation")
                .select("usable, type")
                .eq("code", values.activationKey)
                .single(); // Expect a single result

            console.log(data)

            if (error) {
                console.error("Error checking activation code:", error.message);
                message.error({content: "Er is iets mis gegaan met het valideren van de activatiecode.", style:{fontSize:'20px'}});
                setLoading(false);
                return;
            }

            if (!data) {
                message.error({content: "De activatiecode bestaat niet", style:{fontSize:'20px'}});
                setLoading(false);
                return;
            }

            if (!data.usable) {
                message.error({content: "Deze activatiecode is al in gebruik.", style:{fontSize:'20px'}});
                setLoading(false);
                return;
            }

            // Activation code is valid and usable
            setUserData((prevData) => ({
                ...prevData,
                activationKey: values.activationKey,
            }));
            setUserType(data.type);
            if(data.type === 'user'){setStep(2);}
            if((data.type === 'caretaker') || (data.type === 'responsible')){setStep(7);}

        } catch (err) {
            console.error("Unexpected error during activation code validation:", err);
            message.error({content: "Er is iets misgegaan. Probeer het later opnieuw.", style:{fontSize:'20px'}});
        } finally {
            setLoading(false);
        }
    };


    const nameAndBD = (values) => {
        setUserData((prevData) => ({
            ...prevData,
            name: values.Voornaam,
            livingSituation: values.Woonsituatie,
            birthDate: values.Geboortedatum
        }));
        setStep(3);
    };

    // Handle submission of additional info (city and organization)
    const Location = (values) => {
        setUserData((prevData) => ({
            ...prevData,
            city: values.city, // Save city ID, not name
            mobility: values.mobility,
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
    };

    const checkEmailExistence = async (email) => {
        try {
            const { data, error } = await supabase
                .from("Credentials")
                .select("email")
                .eq("email", email)
                .single();

            if (error && error.code !== "PGRST116") {
                console.error("Error checking email existence:", error.message);
                message.error({content: "Er is iets misgegaan tijdens de validatie van uw e-mailadres.", style:{fontSize:'20px'}});
                return true;  // Return true if there's an error
            }

            if (data) {
                message.error({content: "Dit e-mailadres is al geregistreerd.", style:{fontSize:'20px'}});
                return true;  // Return true if email is already taken
            }

            return false;  // Return false if email is available
        } catch (err) {
            console.error("Unexpected error during email validation:", err);
            message.error({content: "Er is iets misgegaan. Probeer het later opnieuw.", style:{fontSize:'20px'}});
            return true;  // Return true if an unexpected error occurs
        }
    };


    const saveCaretaker = async (values) => {
        setLoading(true);
        const { vname, aname } = values;
        const caretakerName = vname + ' ' + aname;
        const hashedPassword = CryptoJS.SHA256(values.password).toString();

        const emailExists = await checkEmailExistence(values.email.toLowerCase());
        if (emailExists) {
            setLoading(false);
            return;
        }

        try {
            const { error: careError } = await supabase
                .from("Caretaker")
                .insert({
                    id: userData.activationKey,
                    name: caretakerName,
                    phone_number: values.phone,
                    email: values.email.toLowerCase()
                });

            if (careError) throw careError;

            const { error: credError } = await supabase
                .from("Credentials")
                .insert({
                    user_id: userData.activationKey,
                    email: values.email.toLowerCase(),
                    password: hashedPassword,
                    type: userType
                });

            if (credError) throw credError;

            message.success({content: "Account succesvol aangemaakt", style:{fontSize:'20px'}});

        } catch (error) {
            console.error("something went wrong", error);
        } finally {
            setLoading(false);
        }
    };

    const saveUserProfile = async (userData) => {
        let insertedCredentialId = null; // Track inserted IDs for rollback
        let insertedUserId = null;
        let activationKeyUpdated = false; // Track if activation key was updated

        try {
            // Insert data into "Credentials" table
            const { data: credentialData, error: credentialError } = await supabase
                .from("Credentials")
                .insert({
                    user_id: userData.activationKey,
                    email: userData.email,
                    password: userData.password,
                })
                .select("user_id")
                .single(); // Retrieve the inserted ID

            if (credentialError) {
                throw new Error(`Error saving credentials: ${credentialError.message}`);
            }
            insertedCredentialId = credentialData.id;

            // Insert data into "User" table
            const { data: userDataResponse, error: userError } = await supabase
                .from("User")
                .insert({
                    name: userData.name,
                    id: userData.activationKey,
                    birthdate: userData.birthDate,
                    access_level: userData.niveau,
                })
                .select("id")
                .single();

            if (userError) {
                throw new Error(`Error saving user data: ${userError.message}`);
            }
            insertedUserId = userDataResponse.id;

            // Insert data into "User information" table
            const { data: profileData, error: profileError } = await supabase
                .from("User information")
                .insert({
                    user_id: userData.activationKey,
                    living_situation: userData.livingSituation,
                    location: userData.city,
                    mobility: userData.mobility,
                    gender: userData.gender,
                    sexuality: userData.sexuality,
                    looking_for: userData.relationshipPreference,
                });

            if (profileError) {
                throw new Error(`Error saving profile data: ${profileError.message}`);
            }

            const { error: activationKeyError } = await supabase
                .from("Activation")
                .update({ usable: false })
                .eq("code", userData.activationKey);

            if (activationKeyError) {
                throw new Error(`Error updating activation key: ${activationKeyError.message}`);
            }
            activationKeyUpdated = true;

            console.log("Profile saved successfully", {
                credentialData,
                userDataResponse,
                profileData,
            });

            return { success: true };
        } catch (error) {
            console.error("Error saving user profile:", error.message);

            if (insertedCredentialId) {
                await supabase.from("Credentials").delete().eq("user_id", insertedCredentialId);
            }
            if (insertedUserId) {
                await supabase.from("User").delete().eq("id", insertedUserId);
            }
            await supabase
                .from("User information")
                .delete()
                .eq("user_id", userData.activationKey);

            if (activationKeyUpdated) {
                // Revert the "usable" column to true if it was updated
                await supabase
                    .from("Activation")
                    .update({ usable: true })
                    .eq("code", userData.activationKey);
            }

            return { success: false, error: error.message };
        }
    };


    const EmailAndPassword = async (values) => {
        setLoading(true);
        try {
            // Convert email to lowercase
            const lowercaseEmail = values.email.toLowerCase();

            // Check if email already exists using lowercase email
            const emailExists = await checkEmailExistence(lowercaseEmail);
            if (emailExists) {
                setLoading(false);
                return;
            }

            // Hash the password
            const hashedPassword = CryptoJS.SHA256(values.password).toString();

            // Update user data with lowercase email and hashed password
            const updatedUserData = {
                ...userData,
                email: lowercaseEmail,
                password: hashedPassword,
            };

            console.log("User Data to Submit:", updatedUserData);

            // Save user profile
            await saveUserProfile(updatedUserData);

            // Show success message
            message.success({content: "Account aangemaakt! Je kan een profielfoto toevoegen in je profiel.", style:{fontSize:'20px'}});
            navigate('/login');
        } catch (err) {
            console.error("Unexpected error during email validation:", err);
            message.error({content: "Er is iets misgegaan. Probeer het later opnieuw.", style:{fontSize:'20px'}});
        } finally {
            setLoading(false);
        }
    };


    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    overflowY: 'auto',
                    backgroundImage: `url(${forestImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: themeColors.primary10,
                    position: 'relative',
                    zIndex: '0'
                }}
            >
                <ButterflyIcon color="rgba(255, 255, 255, 0.2)" />
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
                                        : step === 5
                                            ? "Beschermings niveau"
                                            : step === 6
                                                ? "De laatste stap"
                                                : "Wie ben je?"
                    }
                >
                    {step === 1 && (
                        <Form form={form} name="activationForm" onFinish={activationCode}>
                            <Form.Item
                                className="form-item"
                                label="Activation Key"
                                name="activationKey"
                                initialValues={{ activationKey: userData.activationKey || '' }}
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
                        <Form name="accountCreationForm" onFinish={nameAndBD}
                              initialValues={{ Voornaam: userData.name || '',
                                  Woonsituatie: userData.livingSituation || ''}}>
                            <Form.Item
                                className="form-item"
                                label="Voornaam"
                                name="Voornaam"
                                rules={[{ required: true, message: 'Vul uw voornaam in' },
                                    { min: 2, message: 'Naam moet minstens 2 letters lang zijn' }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                className="form-item"
                                label="Woonsituatie"
                                name="Woonsituatie"
                                rules={[{ required: true, message: 'Selecteer een woonsituatie' }]}
                            >
                                <Select placeholder="Selecteer uw woonsituatie">
                                    <Select.Option value="Woont in bij ouders">Woont in bij ouders</Select.Option>
                                    <Select.Option value="Woont alleen">Woont alleen</Select.Option>
                                    <Select.Option value="Begeleid wonen">Begeleid wonen</Select.Option>
                                    <Select.Option value="Woont in groepsverband">Woont in groepsverband</Select.Option>
                                    <Select.Option value="Woont in zorginstelling">Woont in zorginstelling</Select.Option>
                                    <Select.Option value="Andere">Andere</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="Geboortedatum"
                                name="Geboortedatum"
                                rules={[{ required: true, message: 'Selecteer uw geboortedatum, of typ het uit in het formaat "DD-MM-YYYY"' }]}
                            >
                                <div style={{marginBottom: '1rem'}}>
                                    <input
                                        type="date"
                                        id="birthdate"
                                        style={{
                                            backgroundColor: themeColors.primary1,
                                            width: '100%',
                                            padding: '10px',
                                            fontSize: '16px',
                                            border: `1px solid ${themeColors.primary4}`, // Use primary1 for the border color
                                            borderRadius: '4px',
                                            boxSizing: 'border-box',
                                        }}

                                        max={new Date().toISOString().split('T')[0]} // Disables future dates
                                        onChange={(e) => {
                                            const selectedDate = new Date(e.target.value);
                                            const today = new Date();
                                            const age = today.getFullYear() - selectedDate.getFullYear();
                                            if (age < 18) {
                                                message.error({content: 'Je moet minstens 18 jaar oud zijn', style:{fontSize:'20px'}});
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                </div>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" style={{width: '100%'}}>Volgende</Button>
                                <Button onClick={goBack} style={{marginTop: '8px', width: '100%'}}>Terug</Button>
                            </Form.Item>
                        </Form>
                    )}

                    {step === 3 && (
                        <Form name="additionalInfoForm" onFinish={Location}
                              initialValues={{city: userData.city || ''}}>
                            <Form.Item
                                className="form-item"
                                label="Stad"
                                name="city"
                                rules={[{required: true, message: 'Selecteer uw stad'}]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Zoek en selecteer uw stad"
                                    onSearch={handleSearch} // Trigger search
                                    filterOption={false} // Disable client-side filtering
                                    options={locations.map((location) => ({
                                        value: location.id, // Use ID as the value
                                        label: location.Gemeente, // Display gemeente
                                    }))}
                                />
                            </Form.Item>
                            <Form.Item
                                className="form-item"
                                label="Kan zelfstandig verplaatsen"
                                name="mobility"
                                rules={[{ required: true, message: 'Selecteer uw mobiliteitsoptie' }]}
                            >
                                <Select>
                                    <Select.Option value="True">Ja</Select.Option>
                                    <Select.Option value="False">Nee</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                    Volgende
                                </Button>
                                <Button onClick={goBack} style={{ marginTop: '8px', width: '100%' }}>
                                    Terug
                                </Button>
                            </Form.Item>
                        </Form>
                    )}

                    {step === 4 && (
                        <Form name="additionalInfoForm" onFinish={Sexuality}
                              initialValues={{ gender: userData.gender || '',
                                  sexuality: userData.sexuality || ''}}>
                            <Form.Item label="Geslacht" name="gender" rules={[{ required: true, message: 'Selecteer uw geslacht' }]}>
                                <Select placeholder="Selecteer uw geslacht">
                                    <Select.Option value="Man">Man</Select.Option>
                                    <Select.Option value="Vrouw">Vrouw</Select.Option>
                                    <Select.Option value="Non-binair">Non-binair</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item label="Valt op" name="sexuality" rules={[{ required: true, message: 'Selecteer uw seksualiteit' }]}>
                                <Select placeholder="Selecteer uw seksualiteit">
                                    <Select.Option value="Mannen">Mannen</Select.Option>
                                    <Select.Option value="Vrouwen">Vrouwen</Select.Option>
                                    <Select.Option value="Beide">Beide</Select.Option>
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
                                    <Select.Option value="Relatie">Relatie</Select.Option>
                                    <Select.Option value="Vrienden">Vrienden</Select.Option>
                                    <Select.Option value="Intieme ontmoetingen">Intieme ontmoetingen</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>Volgende</Button>
                                <Button onClick={goBack} style={{ marginTop: '8px', width: '100%' }}>Terug</Button>
                            </Form.Item>
                        </Form>
                    )}

                    {step === 5 && (
                        <Form name="preferenceForm" onFinish={lvlSelect}
                              initialValues={{ niveau: userData.niveau || '' }}>
                            <b>Selecteer de optie die het beste past bij jou en je begeleider</b> <Divider/>
                            <Form.Item name="niveau" rules={[{ required: true, message: 'Selecteer een optie' }]}>
                                <Radio.Group>
                                    <Radio value="Volledige toegang">Mijn begeleider heeft volledige toegang en kan inloggen op mijn account</Radio>
                                    <Divider/>
                                    <Radio value="Gesprekken">Mijn begeleider kan mijn chats lezen</Radio> <Divider/>
                                    <Radio value="Contacten">Mijn begeleider kan zien met wie ik chat maar kan de chats niet lezen</Radio> <Divider/>
                                    <Radio value="Publiek profiel">Mijn begeleider kan enkel zien wat ik op mijn profiel zet, net zoals andere gebruikers</Radio> <Divider/>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>Volgende</Button>
                                <Button onClick={goBack} style={{ marginTop: '8px', width: '100%' }}>Terug</Button>
                            </Form.Item>
                        </Form>
                    )}

                    {step === 6 && (
                        <Form name="emailPasswordForm" onFinish={EmailAndPassword}
                              initialValues={{ email: userData.email || '',
                                  password: userData.password || ''
                              }}>
                            <Form.Item
                                className="form-item"
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Gelieve uw email adress in te vullen' },
                                    { type: 'email', message: 'Gelieve een geldig email adress in te vullen' }
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                className="form-item"
                                label="Wachtwoord"
                                name="password"
                                rules={[{ required: true, message: 'Gelieve uw wachtwoord in te vullen' }]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                className="form-item"
                                label="Confirm Password"
                                name="confirmPassword"
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: 'Gelieve uw wachtwoord te bevestiggen' },
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

                    {step === 7 && (
                        <Form name="userForm" onFinish={saveCaretaker}>
                            <Form.Item
                                className="form-item"
                                label="Voornaam"
                                name="vname"
                                rules={[
                                    { required: true, message: 'Gelieve uw voornaam in te vullen' },
                                    { min: 2, message: 'Naam moet minstens 2 letters lang zijn' },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                className="form-item"
                                label="Achternaam"
                                name="aname"
                                rules={[
                                    { required: true, message: 'Gelieve uw achternaam in te vullen' },
                                    { min: 2, message: 'Naam moet minstens 2 letters lang zijn' },
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                className="form-item"
                                label="GSM Nummer"
                                name="phone"
                                style={{ marginBottom: '48px' }}
                                rules={[
                                    { required: true, message: 'Gelieve uw GSM nummer in te vullen' },
                                    {
                                        pattern: /^[+]?[0-9]{10,15}$/,
                                        message: 'Gelieve een geldig GSM nummer in te vullen (b.v., +1234567890)',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                className="form-item"
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Gelieve uw email adress in te vullen' },
                                    { type: 'email', message: 'Gelieve een geldig email adress in te vullen' },
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                className="form-item"
                                label="Wachtwoord"
                                name="password"
                                rules={[
                                    { required: true, message: 'Gelieve uw wachtwoord in te vullen' },
                                    { min: 6, message: 'Wachtwoord moet minstens 6 characters lang zijn' },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                className="form-item"
                                label="Bevestig Wachtwoord"
                                name="confirmPassword"
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: 'Gelieve uw wachtwoord te bevestiggen' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('De wachtwoorden zijn niet hetzelfde'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                className="form-item"
                                name="terms"
                                valuePropName="checked"
                                rules={[
                                    {
                                        validator: (_, value) =>
                                            value
                                                ? Promise.resolve()
                                                : Promise.reject(new Error('U moet de terms and services accepteren')),
                                    },
                                ]}
                            >
                                <Checkbox>
                                    I accept the{' '}
                                    <a
                                        href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ textDecoration: 'underline' }}
                                    >
                                        Terms and Services
                                    </a>.
                                </Checkbox>
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                    Submit
                                </Button>
                                <Button onClick={goBack} style={{ marginTop: '8px', width: '100%' }}>
                                    Back
                                </Button>
                            </Form.Item>
                        </Form>
                    )}
                </Card>
                {/* User Data Display */}
                <div
                    style={{
                        marginTop: '20px',
                        padding: '10px',
                        backgroundColor: '#f5f5f5',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        width: '100%',
                        maxWidth: '400px',
                        overflowWrap: 'break-word',
                    }}
                >
                    <h3>User Data</h3>
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                {JSON.stringify(userData, null, 2)}
            </pre>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default ActivationPage;
