import React, { useEffect, useState } from 'react';
import { Avatar, Divider, Select, ConfigProvider, Switch, Spin } from 'antd';
import {
    UserSwitchOutlined,
    BgColorsOutlined,
    HeartOutlined,
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import '../CSS/AntDesignOverride.css';
import {antThemeTokens, ButterflyIcon, themes} from '../themes';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://flsogkmerliczcysodjt.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q'
);

// Initial list of caretakers
const initialCaretakers =
    { id: 1, name: 'John Doe', accessLevel: 'Volledige toegang', picture: 'https://i.pravatar.cc/150?img=1' };

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
                    .from('User')
                    .select('id, name, birthdate, profile_picture, caretaker, access_level')
                    .eq('id', actCode);

                if (userError) throw userError;
                if (userData.length > 0) {
                    const user = userData[0];

                    // Fetch user information
                    const { data: userInfoData, error: userInfoError } = await supabase
                        .from('User information')
                        .select('theme, sexuality')
                        .eq('user_id', user.id);

                    if (userInfoError) throw userInfoError;

                    let parsedTheme = 'blauw';
                    let isDarkMode = false;

                    if (userInfoData && userInfoData.length > 0) {
                        const userInfo = userInfoData[0];
                        user.theme = userInfo.theme;
                        user.sexuality = userInfo.sexuality;

                        if (userInfo.theme) {
                            try {
                                const [themeName, darkModeFlag] = JSON.parse(userInfo.theme);
                                parsedTheme = themeName;
                                isDarkMode = darkModeFlag;
                            } catch (error) {
                                console.error('Error parsing theme', error);
                            }
                        }
                    }

                    const {data: caretakerInfo, error: cartakerInfoError}= await supabase
                        .from('Caretaker')
                        .select('name, profile_picture')
                        .eq('id', user.caretaker)

                    if (caretakerInfo.length > 0){
                        const caretaker = caretakerInfo[0];
                        user.caretaker = {name: caretaker.name, profilePicture: caretaker.profile_picture, accessLevel: user.access_level}
                    }

                    // Set the user profile data with the theme
                    setProfileData({
                       ...user,
                        theme: [parsedTheme, isDarkMode]
                    });
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [actCode]);

    return { profileData, isLoading, error };
};

const ProfileCard = () => {
    const { profileData, isLoading, error } = useFetchProfileData(localStorage.getItem('user_id'));
    const [theme, setTheme] = useState('blauw');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const themeKey = isDarkMode ? `${theme}_donker` : theme;
    const themeColors = themes[themeKey] || themes.blauw;
    const [profilePicture, setProfilePicture] = useState('https://example.com/photo.jpg');
    const [caretaker, setCaretaker] = useState({});
    const [sexuality, setSexuality] = useState('');

    const applyThemeToCSS = (themeColors) => {
        const root = document.documentElement;
        Object.entries(themeColors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
    };

    useEffect(() => {
        applyThemeToCSS(themeColors); // Apply the selected theme
    }, [themeColors]);


    // Set theme and dark mode when profileData changes
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
        if (profileData.sexuality) {
            setSexuality(profileData.sexuality);
        }
        if (profileData.caretaker){
            setCaretaker(profileData.caretaker)
        }
    }, [profileData]);

    console.log(profileData)

    // Define async save functions
    const saveField = async (field, value) => {
        try {
            const { data, error } = await supabase
                .from('User information')
                .update({ [field]: value })
                .eq('user_id', profileData.id);
            if (error) throw error;

            console.log(`${field} saved successfully with value ${value}`);
        } catch (error) {
            console.error(`Error saving ${field}:`, error);
        }
    };

    const debouncedSaveTheme = debounce(async (newTheme, darkModeFlag) => {
        try {
            const themeData = [newTheme, darkModeFlag]; // Ensure both theme and dark mode flag are saved together
            await saveField('theme', JSON.stringify(themeData));
            localStorage.setItem('theme',JSON.stringify(themeData))// Save it as a stringified JSON array
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    }, 500);

    const debouncedSaveSexuality = debounce((value) => saveField('sexuality', value), 1000);

    const handleAccessLevelChange = (value, id) => {
        setCaretaker((prevCaretakers) =>
            prevCaretakers.map((caretaker) =>
                caretaker.id === id ? { ...caretaker, accessLevel: value } : caretaker
            )
        );
    };

    const handleThemeChange = (value) => {
        setTheme(value);
        debouncedSaveTheme(value, isDarkMode); // Save theme with dark mode flag
    };

    const handleThemeToggle = (checked) => {
        setIsDarkMode(checked);
        debouncedSaveTheme(theme, checked); // Save theme with dark mode flag
    };

    const handleSexualityChange = (value) => {
        setSexuality(value);
        debouncedSaveSexuality(value);
    };

    const calculateAge = (birthdate) => {
        if (!birthdate) return 'Onbekend';
        const birthDate = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    if (isLoading) return <Spin tip="Profiel laden..." />;
    if (error) return <p>Failed to load profile: {error}</p>;

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div
                style={{
                    padding: '20px',
                    position: 'relative',
                    minWidth: '100%',
                    minHeight: '100vh',
                    backgroundColor: themeColors.primary2,
                    color: themeColors.primary10,
                    zIndex: '0'
                }}
            >
                <ButterflyIcon color={themeColors.primary3} />

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar
                        src={profilePicture || "https://example.com/photo.jpg"} // Fallback to default avatar
                        alt={profileData.name || "No Name"}
                        style ={{
                            minWidth: '200px',
                            minHeight: '200px',
                            borderRadius: '50%'
                        }}
                    />
                    <h2 style={{ margin: '0', textAlign: 'center' }}>
                        {profileData.name || 'Naam'}, {calculateAge(profileData.birthdate) || 'Leeftijd'}
                    </h2>
                    <Divider />
                </div>

                <p style={{ display: 'flex', alignItems: 'center', gap: '2%' }}>
                    <strong style={{ width: '20%', minWidth: '150px' }}>
                        <BgColorsOutlined /> Kies een kleur:
                    </strong>
                    <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
                        <Select
                            style={{ flexGrow: 1, marginRight: '10px' }}
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
                            style={{ marginLeft: 'auto' }}
                        />
                    </div>
                </p>

                <Divider />

                <p>
                    <strong>
                        <UserSwitchOutlined /> Begeleiding met toegang:
                    </strong>
                </p>

                <p style={{ display: 'flex', alignItems: 'center', gap: '2%', marginBottom: '20px' }}>
                    <div style={{ width: '20%', minWidth: '150px' }}>
                        <Avatar src={caretaker.profilePicture} style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '15px' }} />
                        <span>{caretaker.name}</span>
                    </div>

                    <Select
                        style={{flex: 1, minWidth: '200px'}}
                        value={caretaker.accessLevel}
                        onChange={(value) => handleAccessLevelChange(value, caretaker.id)}
                    >
                        <Select.Option value="Volledige toegang">Volledige toegang</Select.Option>
                        <Select.Option value="Gesprekken">Gesprekken</Select.Option>
                        <Select.Option value="Contacten">Contacten</Select.Option>
                        <Select.Option value="Publiek profiel">Publiek profiel</Select.Option>
                    </Select>
                </p>

                <Divider />

                <p style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '2%' }}>
                    <strong style={{ width: '20%', minWidth: '150px' }}>
                        <HeartOutlined /> Ik ben geïntereseerd in:
                    </strong>
                    <Select
                        style={{flex: 1, minWidth: '200px'}}
                        placeholder="Selecteer seksualiteit"
                        value={sexuality}
                        options={[
                            { value: 'Mannen', label: 'Mannen' },
                            { value: 'Vrouwen', label: 'Vrouwen' },
                            { value: 'Beide', label: 'Beide' },
                        ]}
                        onChange={handleSexualityChange}

                    />
                </p>

                <Divider />
            </div>
        </ConfigProvider>
    );
};

export default ProfileCard;
