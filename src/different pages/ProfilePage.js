// Import necessary libraries
import React, { useEffect, useState } from 'react';
import {Card, Tag, Avatar, Button, Divider, ConfigProvider} from 'antd';
import { MessageOutlined, CloseOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import '../CSS/Ant design overide.css'
import { antThemeTokens, themes } from '../themes';

// The ProfileCard component
const ProfileCard = () => {
    const [theme, setTheme] = useState('default');
    const themeColors = themes[theme] || themes.default;
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
                color : themeColors.primary10
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
                    icon={<CloseOutlined/>}
                    style={{position: 'absolute', top: '10px', right: '10px'}}
                />

                <h2 style={{textAlign: 'center', margin: '0', fontSize: '24px'}}>Martin, 27</h2>

                <Divider/>

                <p><strong>Locatie:</strong> Leuven</p>

                <Divider/>

                <p><strong>Geslacht:</strong> Man</p>

                <Divider/>

                <p><strong>Interesses:</strong></p>
                <div>
                    <Tag>Voetbal</Tag>
                    <Tag>Wandelen</Tag>
                    <Tag>Gezelschapsspellen spelen</Tag>
                    <Tag>Iets gaan drinken met vrienden</Tag>
                </div>

                <Divider/>

                <p><strong>Is op zoek naar:</strong></p>
                <div>
                    <Tag>Vrienden</Tag>
                    <Tag>Relatie</Tag>
                </div>

                <Divider/>

                <p><strong>Woonsituatie:</strong> Woont alleen</p>

                <Divider/>

                <p><strong>Kan zich zelfstanding verplaatsen:</strong> Ja</p>

            {/* Chat button in the bottom right */}
            <Button
                type="primary"
                icon={<MessageOutlined/>}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 1000 // Ensures it stays on top
                }}
            >
                Chat met Martin
            </Button>
        </div>
        </ConfigProvider>
    );
};

export default ProfileCard;
