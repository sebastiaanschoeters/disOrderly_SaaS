import React, { useEffect, useState } from 'react';
import { Card, Tag, Avatar, Button, Divider, Select, Popconfirm, message, ConfigProvider, Switch } from 'antd';
import {
    CloseOutlined,
    SaveOutlined,
    DeleteOutlined,
    CaretDownOutlined,
    UserSwitchOutlined,
    BgColorsOutlined,
    HeartOutlined
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import '../CSS/Ant design overide.css';
import { antThemeTokens, themes } from '../themes';

// Initial list of caretakers
const initialCaretakers = [
    { id: 1, name: 'John Doe', accessLevel: 'full', picture: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'Jane Smith', accessLevel: 'contact', picture: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, name: 'Sam Brown', accessLevel: 'chat', picture: 'https://i.pravatar.cc/150?img=3' },
];

const ProfileCard = () => {
    const [theme, setTheme] = useState('blauw');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const themeKey = isDarkMode ? `${theme}_donker` : theme;
    const themeColors = themes[themeKey] || themes.blauw;
    const [images, setImages] = useState([]);
    const [profilePicture, setProfilePicture] = useState('https://example.com/photo.jpg');
    const [caretakers, setCaretakers] = useState(initialCaretakers);

    // Update access level for caretakers
    const handleAccessLevelChange = (value, id) => {
        setCaretakers(prevCaretakers =>
            prevCaretakers.map(caretaker =>
                caretaker.id === id ? { ...caretaker, accessLevel: value } : caretaker
            )
        );
    };

    // Remove a caretaker from the list
    const handleDelete = (id) => {
        if (caretakers.length <= 1) {
            message.warning("You must have at least one caretaker.");
            return;
        }
        setCaretakers(prevCaretakers => prevCaretakers.filter(caretaker => caretaker.id !== id));
    };

    // Toggle between light and dark themes
    const handleThemeToggle = (checked) => {
        setIsDarkMode(checked);
    };

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div style={{
                padding: '20px',
                position: 'relative',
                width: '100%',
                minHeight: '100vh',
                backgroundColor: themeColors.primary2,
                color: themeColors.primary10,
            }}>
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
                                    margin: '5px'
                                }}
                            />
                        ))
                    ) : (
                        <Avatar
                            src={profilePicture}
                            alt="Martin's Profile Picture"
                            size={100}
                            style={{ margin: '20px auto', display: 'block', objectFit: 'cover' }}
                        />
                    )}
                    <h2 style={{ textAlign: 'center', margin: '0', fontSize: '24px' }}>Martin, 27</h2>
                    <Divider />
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        style={{ position: 'absolute', top: '10px', right: '10px' }}
                    />
                </div>

                <p style={{ display: 'flex', alignItems: 'center', gap: '2%' }}>
                    <strong style={{ width: '20%', minWidth: '150px' }}><BgColorsOutlined /> Kies een kleur:</strong>
                    <Select
                        style={{ width: '58%' }}
                        placeholder="Selecteer een kleur"
                        options={Object.keys(themes).filter(key => !key.endsWith('_donker')).map(themeKey => ({
                            value: themeKey,
                            label: themeKey.charAt(0).toUpperCase() + themeKey.slice(1),
                        }))}
                        value={theme}
                        onChange={value => setTheme(value)}
                    />
                    <Switch
                        checked={isDarkMode}
                        onChange={handleThemeToggle}
                        checkedChildren="Donker"
                        unCheckedChildren="Licht"
                        style={{ marginLeft: '10px' }}
                    />
                </p>

                <Divider />

                <p><strong><UserSwitchOutlined /> Begeleiding met toegang:</strong></p>

                {caretakers.map(caretaker => (
                    <div
                        key={caretaker.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '2%', marginBottom: '20px' }}
                    >
                        <Avatar src={caretaker.picture} style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                        <span style={{ width: '18%' }}>{caretaker.name}</span>
                        <Select
                            value={caretaker.accessLevel}
                            onChange={value => handleAccessLevelChange(value, caretaker.id)}
                            style={{ width: '50%' }}
                            suffixIcon={<CaretDownOutlined />}
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
                    <strong style={{ width: '20%' }}><HeartOutlined /> Seksualiteit:</strong>
                    <Select
                        style={{ width: '78%' }}
                        placeholder="Selecteer seksualiteit"
                        options={[
                            { value: 'Hetero', label: 'Heteroseksueel' },
                            { value: 'Bi', label: 'Biseksueel' },
                            { value: 'Homo', label: 'Homoseksueel' },
                        ]}
                    />
                </p>

                <Divider />

                <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 1000,
                    }}
                >
                    Veranderingen opslaan
                </Button>
            </div>
        </ConfigProvider>
    );
};

export default ProfileCard;
