// Import necessary libraries
import React, { useState } from 'react';
import { Card, Tag, Avatar, Button, Divider, ConfigProvider } from 'antd';
import {
    MessageOutlined,
    CloseOutlined,
    EnvironmentOutlined,
    UserOutlined,
    HeartOutlined,
    StarOutlined,
    HomeOutlined,
    CarOutlined,
    TeamOutlined
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import '../CSS/AntDesignOverride.css';
import { antThemeTokens, themes } from '../themes';

// The ProfileCard component
const ProfileCard = () => {
    const [theme, setTheme] = useState('blauw');
    const themeColors = themes[theme] || themes.blauw;
    const [images, setImages] = useState([]); /* get images from database */

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div
                style={{
                    padding: '20px',
                    position: 'relative',
                    width: '100%',
                    height: '100vh',
                    backgroundColor: themeColors.primary2,
                    color: themeColors.primary10
                }}>
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {images.length > 0 ? (
                        images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Uploaded ${index}`}
                                style={{ width: '100px', height: '100px', objectFit: 'cover', margin: '5px' }}
                            />
                        ))
                    ) : (
                        <Avatar
                            src="https://example.com/photo.jpg"
                            alt="Martin's Profile Picture"
                            size={100}
                            style={{ margin: '20px auto', display: 'block' }}
                        />
                    )}
                </div>

                {/* Exit button in the top right */}
                <Button
                    type="text"
                    icon={<CloseOutlined />}
                    style={{ position: 'absolute', top: '10px', right: '10px' }}
                />

                <h2 style={{ textAlign: 'center', margin: '0'}}>Thomas, 36</h2>

                <Divider />

                <p style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '2%' }}>
                    <strong style={{ width: '20%', minWidth: '150px' }}><TeamOutlined /> Organisatie: </strong>
                    V(l)inder
                </p>

                <Divider />

                <p style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '2%' }}>
                    <strong style={{ width: '20%', minWidth: '150px' }}><UserOutlined /> Geslacht: </strong>
                    Man
                </p>


                {/* Chat button in the bottom right */}
                <Button
                    type="primary"
                    icon={<MessageOutlined />}
                    style={{
                        position: 'fixed',
                        bottom: '20%',
                        left: '40%',
                    }}
                >
                    Contacteer Thomas
                </Button>
            </div>
        </ConfigProvider>
    );
};

export default ProfileCard;
