import React, {useEffect, useState} from 'react';
import {Avatar, Button, ConfigProvider, Divider, message, Upload} from 'antd';
import { MailOutlined, PhoneOutlined, UploadOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import '../../CSS/AntDesignOverride.css';
import '../../CSS/EditableProfilePage.css';
import {antThemeTokens, ButterflyIcon, themes} from '../../Extra components/themes';
import TextArea from "antd/es/input/TextArea";
import {createClient} from "@supabase/supabase-js";
import HomeButton from '../../Extra components/HomeButtonCaretaker'
import useFetchCaretakerData from "../../UseHooks/useFetchCaretakerData";
import ThemeSelector from "../../Extra components/ThemeSelector";
import useThemeOnCSS from "../../UseHooks/useThemeOnCSS";
import {requests} from "../../Utils/requests";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ProfileCard = () => {
    const caretaker_id = localStorage.getItem('user_id');
    const name = localStorage.getItem('name')
    const savedProfilePicture = localStorage.getItem('profile_picture')
    let [savedTheme, savedDarkMode] = JSON.parse(localStorage.getItem('theme'));

    const { profileData, isLoading, error} = useFetchCaretakerData(caretaker_id, { fetchOrganization: true})
    const [theme, setTheme] = useState(savedTheme);
    const [isDarkMode, setIsDarkMode] = useState(savedDarkMode);
    const themeKey = isDarkMode ? `${theme}_donker` : theme;
    const themeColors = themes[themeKey] || themes.blauw;

    const [profilePicture, setProfilePicture] = useState(savedProfilePicture);
    const [uploading, setUploading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('')
    const [email, setEmail] = useState('')

    useThemeOnCSS(themeColors);

    useEffect(() => {
        if (profileData.theme) {
            try {
                let savedTheme = profileData.theme;

                if (savedTheme.endsWith('_donker')) {
                    savedTheme = savedTheme.replace('_donker', '');
                    setIsDarkMode(true);
                }

                setTheme(savedTheme);
            } catch (error) {
                console.error('Error parsing theme data:', error);
            }
        }
        if (profileData.profile_picture) {
            const imageUrlWithCacheBuster = `${profileData.profile_picture}?t=${new Date().getTime()}`;
            setProfilePicture(imageUrlWithCacheBuster);
        }
        if (profileData.phone_number) {
            setPhoneNumber(profileData.phone_number)
        }
        if (profileData.email){
            setEmail(profileData.email)
        }
    }, [profileData]);

    const saveField = async (field, value) => {
        const fieldTranslations = {
            theme: "thema",
            phone_number: "gsm nummer",
            email: "email",
        };

        const dutch_field = fieldTranslations[field] || field;

        try {
            const { error } = await supabase
                .from('Caretaker')
                .update({ [field]: value })
                .eq('id', profileData.id);

            if (error) {
                message.error(`Probleem bij het opslaan van ${dutch_field}`);
                console.error(`Error saving ${field}:`, error);
                return;  // Early return to exit function
            }

            // Display success message
            message.success(`${dutch_field} opgeslagen`);
            console.log(`${field} saved successfully with value ${value}`);
        } catch (error) {
            // Display error message for unexpected errors
            message.error(`Probleem bij het opslaan van ${dutch_field}`);
            console.error(`Unexpected error saving ${field}:`, error);
        }
    };

    const handleThemeChange = async (value) => {
        setTheme(value);
        try {
            const themeData = [value, isDarkMode]; // Ensure both theme and dark mode flag are saved together
            await saveField('theme', JSON.stringify(themeData));
            localStorage.setItem('theme', JSON.stringify(themeData))
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const handleThemeToggle = async (checked) => {
        setIsDarkMode(checked);
        try {
            const themeData = [theme, checked]; // Ensure both theme and dark mode flag are saved together
            await saveField('theme', JSON.stringify(themeData));
            localStorage.setItem('theme', JSON.stringify(themeData))
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const handlePhoneNumberChange = (e) => {
        const newValue = e.target.value.replace(/[^0-9+]/g, '');
        if (newValue.length <= 11) { // Ensure the length is no more than 10
            setPhoneNumber(newValue);
        }
    };

    const handlePhoneNumberSave = (e) => {
        const newValue = e.target.value.replace(/[^0-9+]/g, '');
        if (newValue.length <= 11) { // Ensure the length is no more than 10
            setPhoneNumber(newValue);
            saveField('phone_number', newValue);
        }
    }


    const handleEmailChange = (e) => {
        const newValue = e.target.value;
        setEmail(newValue);
        saveField('email', newValue);
    }

    const handleProfilePictureUpload = async ({ file }) => {
        try {
            setUploading(true);

            const imageUrlWithCacheBuster = await requests(profileData.id, file, 'profile-pictures-caretakers');

            setProfilePicture(imageUrlWithCacheBuster);

            await supabase
                .from('Caretaker')
                .update({ profile_picture: imageUrlWithCacheBuster })
                .eq('id', profileData.id);

            message.success("profiel foto opgeslagen")
        } catch (error) {
            message.error("Probleem bij het uploaden van een niewe profiel foto")
            console.error('Error uploading profile picture:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <ConfigProvider theme={{token: antThemeTokens(themeColors)}}>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                position: 'relative',
                minWidth: '100dvw',
                minHeight: '100vh',
                overflow: 'hidden',
                overflowX: 'hidden',
                backgroundColor: themeColors.primary2,
                color: themeColors.primary10,
                zIndex: '0'
            }}>
                <div
                    style={{
                        width: '80%'
                    }}
                >

                    <HomeButton color={themeColors.primary7}/>
                    <ButterflyIcon color={themeColors.primary3}/>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        paddingBottom: '20px',
                        marginTop: '20px'
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px'}}>
                            <Avatar
                                src={profilePicture}
                                alt={name}
                                style={{
                                    minWidth: '200px',
                                    minHeight: '200px',
                                    borderRadius: '50%'
                                }}
                            />
                            <div>
                                <h2 style={{margin: '0', textAlign: 'center'}}>
                                    {name || 'Naam'}, {profileData.organization || 'Organizatie'}
                                </h2>
                                <div style={{marginTop: '10px', marginBottom: '20px'}}>
                                    <Upload showUploadList={false} beforeUpload={() => false}
                                            onChange={handleProfilePictureUpload}>
                                        <Button icon={<UploadOutlined/>} loading={uploading}>Kies nieuwe
                                            profielfoto</Button>
                                    </Upload>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Divider/>

                    <ThemeSelector
                        theme={theme}
                        isDarkMode={isDarkMode}
                        handleThemeChange={handleThemeChange}
                        handleThemeToggle={handleThemeToggle}
                    />

                    <Divider/>

                    <p style={{width: '100%'}}>
                        <strong style={{display: 'block', marginBottom: '10px'}}>
                            <PhoneOutlined/> Telefoon nummer:
                        </strong>
                        <TextArea
                            style={{width: '100%', minWidth: '200px'}}
                            placeholder="Geef je telefoon nummer in"
                            value={phoneNumber}
                            onChange={handlePhoneNumberChange}
                            onBlur={handlePhoneNumberSave}
                            maxLength={11}
                        />
                    </p>


                    <Divider/>

                    <p style={{width: '100%'}}>
                        <strong style={{display: 'block', marginBottom: '10px'}}>
                            <MailOutlined/> E-mail:
                        </strong>
                        <TextArea
                            style={{width: '100%', minWidth: '200px'}}
                            placeholder="Geef je e-mail adres in"
                            value={email}
                            onChange={handleEmailChange}
                        />
                    </p>


                </div>
            </div>
        </ConfigProvider>
    );
};

export default ProfileCard;