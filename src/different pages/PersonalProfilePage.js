import React, { useEffect, useState } from 'react';
import { Avatar, Button, Divider, Select, Popconfirm, message, ConfigProvider, Switch, Spin } from 'antd';
import {
    CloseOutlined,
    SaveOutlined,
    DeleteOutlined,
    UserSwitchOutlined,
    BgColorsOutlined,
    HeartOutlined,
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import '../CSS/AntDesignOverride.css';
import { antThemeTokens, themes } from '../themes';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://flsogkmerliczcysodjt.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q'
);

// Initial list of caretakers
const initialCaretakers = [
    { id: 1, name: 'John Doe', accessLevel: 'full', picture: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'Jane Smith', accessLevel: 'contact', picture: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, name: 'Sam Brown', accessLevel: 'chat', picture: 'https://i.pravatar.cc/150?img=3' },
];

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
                const { data: profileData, error: profileError } = await supabase
                    .from('Profile')
                    .select('*')
                    .eq('ActCode', actCode);

                if (profileError) throw profileError;
                if (profileData.length > 0) {
                    const profile = profileData[0];
                    let parsedTheme = 'blauw';
                    let isDarkMode = false;

                    if (profile.theme) {
                        try {
                            const [themeName, darkModeFlag] = JSON.parse(profile.theme);
                            parsedTheme = themeName;
                            isDarkMode = darkModeFlag;
                        } catch (error) {
                            console.error('Error parsing theme', error);
                        }
                    }

                    setProfileData({ ...profile, theme: [parsedTheme, isDarkMode] });
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
    const { profileData, isLoading, error } = useFetchProfileData('1547');
    const [theme, setTheme] = useState('blauw');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const themeKey = isDarkMode ? `${theme}_donker` : theme;
    const themeColors = themes[themeKey] || themes.blauw;
    const [images, setImages] = useState([]);
    const [profilePicture, setProfilePicture] = useState('https://example.com/photo.jpg');
    const [caretakers, setCaretakers] = useState(initialCaretakers);
    const [sexuality, setSexuality] = useState('');

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

        if (profileData.picture) {
            setProfilePicture(profileData.picture);
        }
        if (profileData.sexuality) {
            setSexuality(profileData.sexuality);
        }
    }, [profileData]);

    // Define async save functions
    const saveField = async (field, value) => {
        try {
            const { data, error } = await supabase
                .from('Profile')
                .update({ [field]: value })
                .eq('ActCode', profileData.ActCode);
            if (error) throw error;

            console.log(`${field} saved successfully with value ${value}`);
        } catch (error) {
            console.error(`Error saving ${field}:`, error);
        }
    };

    const debouncedSaveTheme = debounce(async (newTheme, darkModeFlag) => {
        try {
            const themeData = [newTheme, darkModeFlag]; // Ensure both theme and dark mode flag are saved together
            await saveField('theme', JSON.stringify(themeData)); // Save it as a stringified JSON array
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    }, 500);

    const debouncedSaveSexuality = debounce((value) => saveField('sexuality', value), 1000);

    const handleAccessLevelChange = (value, id) => {
        setCaretakers((prevCaretakers) =>
            prevCaretakers.map((caretaker) =>
                caretaker.id === id ? { ...caretaker, accessLevel: value } : caretaker
            )
        );
    };

    const handleDelete = (id) => {
        if (caretakers.length <= 1) {
            message.warning('You must have at least one caretaker.');
            return;
        }
        setCaretakers((prevCaretakers) => prevCaretakers.filter((caretaker) => caretaker.id !== id));
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
                    width: '100%',
                    minHeight: '100vh',
                    backgroundColor: themeColors.primary2,
                    color: themeColors.primary10,
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {images.length > 0 ? (
                        images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Uploaded ${index}`}
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    objectFit: 'cover',
                                    borderRadius: '50%',
                                    margin: '5px',
                                }}
                            />
                        ))
                    ) : (
                        <Avatar
                            src={profileData.picture || 'https://example.com/photo.jpg'} // Fallback to default avatar
                            alt={profileData.name || 'No Name'}
                            size={100}
                            style={{ margin: '20px auto', display: 'block' }}
                        />
                    )}
                    <h2 style={{ margin: '0', textAlign: 'center' }}>
                        {profileData.name || 'Naam'}, {calculateAge(profileData.birthDate) || 'Leeftijd'}
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

                {caretakers.map((caretaker) => (
                    <div key={caretaker.id} style={{ display: 'flex', alignItems: 'center', gap: '2%', marginBottom: '20px' }}>
                        <Avatar src={caretaker.picture} style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                        <span style={{ width: '18%' }}>{caretaker.name}</span>
                        <Select
                            value={caretaker.accessLevel}
                            onChange={(value) => handleAccessLevelChange(value, caretaker.id)}
                            style={{ width: '50%' }}
                        >
                            <Select.Option value="full">Volledige toegang</Select.Option>
                            <Select.Option value="chat">Gesprekken</Select.Option>
                            <Select.Option value="contact">Contacten</Select.Option>
                            <Select.Option value="profile">Publiek profiel</Select.Option>
                        </Select>
                        <Popconfirm
                            title="Ben je zeker dat je deze begeleider wilt verwijderen?"
                            onConfirm={() => handleDelete(caretaker.id)}
                            okText="Ja"
                            cancelText="Nee"
                            disabled={caretakers.length <= 1}
                        >
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                disabled={caretakers.length <= 1}
                                style={{ marginLeft: '10px' }}
                            />
                        </Popconfirm>
                    </div>
                ))}

                <Divider />

                <p style={{ display: 'flex', alignItems: 'center', gap: '2%' }}>
                    <strong style={{ width: '20%' }}>
                        <HeartOutlined /> Seksualiteit:
                    </strong>
                    <Select
                        style={{ width: '78%' }}
                        placeholder="Selecteer seksualiteit"
                        value={sexuality}
                        options={[
                            { value: 'Hetero', label: 'Heteroseksueel' },
                            { value: 'Bi', label: 'Biseksueel' },
                            { value: 'Homo', label: 'Homoseksueel' },
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
