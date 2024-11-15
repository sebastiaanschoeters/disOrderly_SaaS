import 'antd/dist/reset.css'; // Import Ant Design styles
import '../CSS/AntDesignOverride.css'
import {antThemeTokens, ButterflyIcon, themes} from '../themes';
import { Button, ConfigProvider } from 'antd';
import { MessageOutlined, UserOutlined, SearchOutlined, SettingOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const [theme, setTheme] = useState('blauw');
    const themeColors = themes[theme] || themes.blauw;
    const navigate = useNavigate();

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div
                style={{
                    padding: '20px',
                    position: 'relative',
                    width: '100%',
                    height: '100vh',
                    backgroundColor: themeColors.primary2,
                    color: themeColors.primary10,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    zIndex: '0',
                }}
            >
                <ButterflyIcon color={themeColors.primary3} />
                <div style={{
                    display: 'flex',
                    gap: '5%',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    width: '100%'
                }}>
                    <Button
                        type="primary"
                        icon={<SearchOutlined style={{ fontSize: '3vw' }} />}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '20vw',
                            height: '20vw',
                            minWidth: '120px',
                            minHeight: '120px',
                        }}
                        onClick={() => navigate('/search')}
                    >
                        <h2 style={{ margin: '0', fontSize: '1.5vw', minWidth: '20px' }}>Mensen vinden</h2>
                    </Button>

                    <Button
                        type="primary"
                        icon={<MessageOutlined style={{ fontSize: '3vw' }} />}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '20vw',
                            height: '20vw',
                            minWidth: '120px',
                            minHeight: '120px',
                        }}
                        onClick={() => navigate('/chatoverview')}
                    >
                        <h2 style={{ margin: '0', fontSize: '1.5vw', minWidth: '20px' }}>Chats</h2>
                    </Button>
                </div>

                <Button
                    type="primary"
                    icon={<UserOutlined style={{ fontSize: '3vw' }} />}
                    style={{
                        position: 'absolute',
                        top: '2%',
                        right: '2%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '15vw',
                        height: '15vw',
                        minWidth: '80px',
                        minHeight: '80px',
                    }}
                    onClick={() => navigate('/profileEdit')}
                >
                    <h2 style={{ margin: '0', fontSize: '1.2vw', minWidth: '10px' }}>Profiel</h2>
                </Button>

                <Button
                    type="primary"
                    icon={<SettingOutlined style={{ fontSize: '2vw' }} />}
                    style={{
                        position: 'absolute',
                        bottom: '2%',
                        left: '2%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '10vw',
                        height: '8vw',
                        minWidth: '60px',
                        minHeight: '40px',
                    }}
                    onClick={() => navigate('/profilePersonal')}
                >
                    <h2 style={{ margin: '0', fontSize: '1vw', minWidth: '10px' }}>Instellingen</h2>
                </Button>

                <Button
                    type="primary"
                    style={{
                        position: 'absolute',
                        bottom: '2%',
                        right: '2%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '10vw',
                        height: '5vw',
                        minWidth: '60px',
                        minHeight: '30px',
                    }}
                    onClick={() => navigate('/login')}
                >
                    <h2 style={{ margin: '0', fontSize: '1vw', minWidth: '10px' }}>Afmelden</h2>
                </Button>
            </div>
        </ConfigProvider>
    );
};

export default HomePage;
