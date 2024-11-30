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

const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q")

// Debounce utility function
const debounce = (func, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
};

const useFetchProfileData = (actCode) => {
    const [profileData, setProfileData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user data
                const { data: userData, error: userError } = await supabase
                    .from('Caretaker')
                    .select('*')
                    .eq('id', actCode);

                if (userError) throw userError;

                if (userData.length > 0) {
                    const user = userData[0];

                    let parsedTheme = 'blauw';
                    let isDarkMode = false;

                    if (user.theme) {
                        try {
                            const [themeName, darkModeFlag] = JSON.parse(user.theme);
                            parsedTheme = themeName;
                            isDarkMode = darkModeFlag;
                        } catch (error) {
                            console.error('Error parsing theme', error);
                        }
                    }

                    // Fetch user information
                    const { data: userOrganization, error: userOrganizationError } = await supabase
                        .from('Activation')
                        .select('organization')
                        .eq('code', user.id);

                    if (userOrganizationError) throw userOrganizationError;

                    if (userOrganization && userOrganization.length > 0) {
                        const userOrganizationData = userOrganization[0];
                        user.organization = userOrganizationData.organization;
                    }

                    console.log(user)
                    // Set the user profile data with the theme
                    setProfileData({
                        ...user,
                        theme: [parsedTheme, isDarkMode]
                    });
                }
            } catch (error) {
                setError(error.message);
            } finally {
                console.log("user element: ", profileData)
                setIsLoading(false);
            }
        };

        fetchData();
    }, [actCode]);

    return { profileData, isLoading, error };
};

const ProfileCard = () => {
    // const { profileData, isLoading, error, interest} = useFetchProfileData(localStorage.getItem('user_id'));
    const { profileData, isLoading, error} = useFetchProfileData(1111)
    const [theme, setTheme] = useState('blauw');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const themeKey = isDarkMode ? `${theme}_donker` : theme;
    const themeColors = themes[themeKey] || themes.blauw;
    const [profilePicture, setProfilePicture] = useState('https://example.com/photo.jpg');
    const [uploading, setUploading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('')
    const [email, setEmail] = useState('')

    const applyThemeToCSS = (themeColors) => {
        const root = document.documentElement;
        Object.entries(themeColors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
    };

    useEffect(() => {
        applyThemeToCSS(themeColors); // Apply the selected theme
    }, [themeColors]);

    useEffect(() => {
        if (profileData.theme) {
            try {
                const [savedTheme, darkModeFlag] = profileData.theme;
                setTheme(savedTheme);
                setIsDarkMode(darkModeFlag);
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
            const fileName = `${profileData.id}-profilePicture`;

            // Check if the file already exists and remove it before upload
            const { data: existingFiles, error: listError } = await supabase.storage
                .from('profile-pictures-caretakers')
                .list('', { search: profileData.id });

            if (listError) {
                console.error('Error checking existing files:', listError);
            } else {
                const existingFile = existingFiles.find(item => item.name.startsWith(profileData.id));
                if (existingFile) {
                    // Remove the existing file if it exists
                    const { error: deleteError } = await supabase.storage
                        .from('profile-pictures-caretakers')
                        .remove([existingFile.name]);
                    if (deleteError) {
                        throw deleteError;
                    }
                }
            }

            // Upload the new file
            const { data, error: uploadError } = await supabase.storage
                .from('profile-pictures-caretakers')
                .upload(fileName, file, { upsert: true }); // upsert ensures replacement if file exists
            if (uploadError) {
                throw uploadError;
            }

            const { data: fileData, error: urlError } = supabase.storage
                .from('profile-pictures-caretakers')
                .getPublicUrl(fileName);
            if (urlError) {
                throw urlError;
            }

            const imageUrl = fileData.publicUrl;

            const imageUrlWithCacheBuster = `${imageUrl}?t=${new Date().getTime()}`;
            setProfilePicture(imageUrlWithCacheBuster);


            // Save the new image URL to the user's profile
            await supabase
                .from('Caretaker')
                .update({ profile_picture: imageUrl })
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

                <p style={{display: 'flex', alignItems: 'center', gap: '2%'}}>
                    <strong style={{width: '20%', minWidth: '150px'}}>
                        <BgColorsOutlined/> Kies een kleur:
                    </strong>
                    <div style={{display: 'flex', flexGrow: 1, alignItems: 'center'}}>
                        <Select
                            style={{flexGrow: 1, marginRight: '10px'}}
                            placeholder="Selecteer een kleur"
                            options={Object.keys(themes)
                                .filter((key) => !key.endsWith('_donker'))
                                .map((themeKey) => ({
                                    value: themeKey,
                                    label: themeKey.charAt(0).toUpperCase() + themeKey.slice(1),
                                }))}
                            value={theme}
                            onChange={handleThemeChange} // When theme is selected, update it
                        />
                        <Switch
                            checked={isDarkMode}
                            onChange={handleThemeToggle} // When dark mode is toggled, update it
                            checkedChildren={<span>Donker</span>}
                            unCheckedChildren={<span>Licht</span>}
                            style={{marginLeft: 'auto'}}
                        />
                    </div>
                </p>

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