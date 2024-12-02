import React, {useEffect, useState} from 'react';
import {Avatar, Button, ConfigProvider, Divider, Select, Switch, Upload} from 'antd';
import {
    BgColorsOutlined,
    MailOutlined,
    PhoneOutlined,
    UploadOutlined
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import '../../CSS/AntDesignOverride.css';
import '../../CSS/EditableProfilePage.css';
import {antThemeTokens, ButterflyIcon, themes} from '../../Extra components/themes';
import TextArea from "antd/es/input/TextArea";
import {createClient} from "@supabase/supabase-js";
import HomeButton from '../../Extra components/HomeButtonCaretaker'
import useFetchCaretakerData from "../../UseHooks/useFetchCaretakerData";
import ThemeSelector from "../../Extra components/ThemeSelector";
import {debounce} from "../../Api/Utils";
import useThemeOnCSS from "../../UseHooks/useThemeOnCSS";
import {uploadProfilePicture} from "../../Utils/uploadProfilePicture";

const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q")

const ProfileCard = () => {
    // const { profileData, isLoading, error, interest} = useFetchProfileData(localStorage.getItem('user_id'));
    const { profileData, isLoading, error} = useFetchCaretakerData(1111, { fetchOrganization: true})
    const [theme, setTheme] = useState('blauw');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const themeKey = isDarkMode ? `${theme}_donker` : theme;
    const themeColors = themes[themeKey] || themes.blauw;
    const [profilePicture, setProfilePicture] = useState('https://example.com/photo.jpg');
    const [uploading, setUploading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('')
    const [email, setEmail] = useState('')

    useThemeOnCSS(themeColors);

    useEffect(() => {
        if (profileData.theme) {
            try {
                console.log(profileData.theme)
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

    // Define async save functions
    const saveField = async (field, value) => {
        try {
            const { data, error } = await supabase
                .from('Caretaker')
                .update({ [field]: value })
                .eq('id', profileData.id);
            if (error) throw error;

            console.log(`${field} saved successfully with value ${value}`);
        } catch (error) {
            console.error(`Error saving ${field}:`, error);
        }
    };

    const debounceSavePhoneNumber = debounce((value) => saveField('phone_number', value), 1000);
    const debounceSaveEmail = debounce((value) => saveField('email', value), 1000);
    const debouncedSaveTheme = debounce(async (newTheme, darkModeFlag) => {
        try {
            const themeData = [newTheme, darkModeFlag]; // Ensure both theme and dark mode flag are saved together
            await saveField('theme', JSON.stringify(themeData));
            localStorage.setItem('theme',JSON.stringify(themeData))// Save it as a stringified JSON array
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    }, 500);

    const handleThemeChange = (value) => {
        setTheme(value);
        debouncedSaveTheme(value, isDarkMode); // Save theme with dark mode flag
    };

    const handleThemeToggle = (checked) => {
        setIsDarkMode(checked);
        debouncedSaveTheme(theme, checked); // Save theme with dark mode flag
    };

    const handlePhoneNumberChange = (e) => {
        const newValue = e.target.value;
        setPhoneNumber(newValue);
        debounceSavePhoneNumber(newValue);
    }

    const handleEmailChange = (e) => {
        const newValue = e.target.value;
        setEmail(newValue);
        debounceSaveEmail(newValue);
    }

    const handleProfilePictureUpload = async ({ file }) => {
        try {
            setUploading(true);

            const imageUrlWithCacheBuster = await uploadProfilePicture(profileData.id, file, 'profile-pictures-caretakers');

            setProfilePicture(imageUrlWithCacheBuster);

            await supabase
                .from('Caretaker')
                .update({ profile_picture: imageUrlWithCacheBuster })
                .eq('id', profileData.id);

        } catch (error) {
            console.error('Error uploading profile picture:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <ConfigProvider theme={{token: antThemeTokens(themeColors)}}>
            <div style={{
                padding: '20px',
                position: 'relative',
                minWidth: '100vw',
                minHeight: '100vh',
                overflow: 'hidden',
                backgroundColor: themeColors.primary2,
                color: themeColors.primary10,
                zIndex: '0'
            }}>
                <HomeButton color={themeColors.primary7} />
                <ButterflyIcon color={themeColors.primary3}/>

                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '20px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px'}}>
                        <Avatar
                            src={profilePicture}
                            alt={profileData.name}
                            style={{
                                minWidth: '200px',
                                minHeight: '200px',
                                borderRadius: '50%'
                            }}
                        />
                        <div>
                            <h2 style={{margin: '0', textAlign: 'center'}}>
                                {profileData.name || 'Naam'}, {profileData.organization || 'Organizatie'}
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

                <p style={{display: 'flex', alignItems: 'center', width: '100%', gap: '2%'}}>
                    <strong style={{width: '20%', minWidth: '150px'}}>
                        <PhoneOutlined/> Telefoon nummer:
                    </strong>
                    <TextArea
                        style={{flex: 1, minWidth: '200px'}}
                        placeholder="Geef je telefoon nummer in"
                        value={phoneNumber}
                        onChange={handlePhoneNumberChange}
                    />
                </p>

                <Divider/>

                <p style={{display: 'flex', alignItems: 'center', width: '100%', gap: '2%'}}>
                    <strong style={{width: '20%', minWidth: '150px'}}>
                        <MailOutlined/> E-mail:
                    </strong>
                    <TextArea
                        style={{minWidth: '200px', flex: 1}}
                        placeholder="Geef je e-mail adres in"
                        value={email}
                        onChange={handleEmailChange}
                    />
                </p>

                <Divider/>
            </div>
        </ConfigProvider>
    );
};

export default ProfileCard;