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
    CarOutlined, BookOutlined
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import '../CSS/Ant design overide.css';
import { antThemeTokens, themes } from '../themes';

const ProfileCard = () => {
    const [theme, setTheme] = useState('blauw');
    const themeColors = themes[theme] || themes.blauw;
    const [images, setImages] = useState([]);

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
                }}
            >
                {/* Header section with profile picture, name, age, and biography */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px'}}>
                        {images.length > 0 ? (
                            images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Uploaded ${index}`}
                                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }}
                                />
                            ))
                        ) : (
                            <Avatar
                                src="https://example.com/photo.jpg"
                                alt="Martin's Profile Picture"
                                size={100}
                            />
                        )}
                        <div>
                            <h2 style={{ margin: '0' }}>Martin, 27</h2>
                            <p style={{ margin: '5px 0' , maxWidth: '550px' }}>
                                Hey, ik eet graag pasta :), maar echt heel graag he, kan wel echt niet koken eigenlijk
                            </p>
                        </div>
                    </div>
                </div>

                {/* Exit button in the top right */}
                <Button
                    type="text"
                    icon={<CloseOutlined />}
                    style={{ position: 'absolute', top: '10px', right: '10px' }}
                />

                <Divider />

                {/* Static fields below */}
                <p style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '2%' }}>
                    <strong style={{ width: '20%', minWidth: '150px' }}><EnvironmentOutlined /> Locatie: </strong>
                    Leuven
                </p>

                <Divider />

                <p style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '2%' }}>
                    <strong style={{ width: '20%', minWidth: '150px' }}><UserOutlined /> Geslacht: </strong>
                    Man
                </p>

                <Divider />

                <p style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '2%' }}>
                    <strong style={{ width: '20%', minWidth: '150px' }}><StarOutlined /> Interesses: </strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                        <Tag>Voetbal</Tag>
                        <Tag>Wandelen</Tag>
                        <Tag>Gezelschapsspellen spelen</Tag>
                        <Tag>Iets gaan drinken met vrienden</Tag>
                    </div>
                </p>

                <Divider />

                <p style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '2%' }}>
                    <strong style={{ width: '20%', minWidth: '150px' }}><HeartOutlined /> Is op zoek naar: </strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                        <Tag>Vrienden</Tag>
                        <Tag>Relatie</Tag>
                    </div>
                </p>

                <Divider />

                <p style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '2%' }}>
                    <strong style={{ width: '20%', minWidth: '150px' }}><HomeOutlined /> Woonsituatie: </strong>
                    Woont alleen
                </p>

                <Divider />

                <p style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '2%' }}>
                    <strong style={{ width: '20%', minWidth: '150px' }}><CarOutlined /> Kan zich zelfstandig verplaatsen: </strong>
                    Ja
                </p>

                {/* Chat button in the bottom right */}
                <Button
                    type="primary"
                    icon={<MessageOutlined />}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 1000
                    }}
                >
                    Chat met Martin
                </Button>
            </div>
        </ConfigProvider>
    );
};

export default ProfileCard;
