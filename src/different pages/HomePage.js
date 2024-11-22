import 'antd/dist/reset.css'; // Import Ant Design styles
import '../CSS/AntDesignOverride.css';
import { antThemeTokens, ButterflyIcon, themes } from '../themes';
import { Button, ConfigProvider, Avatar } from 'antd';
import { MessageOutlined, SearchOutlined, SettingOutlined, PoweroffOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { createClient } from "@supabase/supabase-js";

const HomePage = () => {
    // Load theme from localStorage
    const [themeName, darkModeFlag] = JSON.parse(localStorage.getItem('theme')) || ['blauw', false];
    const [themeColors, setThemeColors] = useState(themes[themeName] || themes.blauw);

    const navigate = useNavigate();
    const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co", "YOUR_SUPABASE_KEY");

    // Update theme colors if theme changes
    useEffect(() => {
        if (darkModeFlag){
            setThemeColors(themes[`${themeName}_donker`] || themes.blauw_donker)
        }
        else{
            setThemeColors(themes[themeName] || themes.blauw);
        }
    }, [themeName, darkModeFlag]);

    const handleLogout = () => {
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('userEmail');
        navigate('/login');
    };

    const userEmail = localStorage.getItem('userEmail'); // Logged-in user's email
    const userId = localStorage.getItem('user_id');
    const name = localStorage.getItem('name');

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

                <div
                    style={{
                        position: 'absolute',
                        top: '2%',
                        left: '2%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        cursor: 'pointer',
                        padding: '10px',
                    }}
                    onClick={() => navigate('/profileEdit')}
                >
                    <Avatar
                        size={60}
                        style={{
                            backgroundColor: themeColors.primary4,
                            color: themeColors.primary10,
                            fontSize: '1.5vw',
                        }}
                    >
                        M
                    </Avatar>
                    <span
                        style={{
                            fontSize: '1.5vw',
                            color: themeColors.primary10,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {name}
                    </span>
                </div>

                <Button
                    type="secondary"
                    icon={<SettingOutlined style={{ fontSize: '2vw' }} />}
                    style={{
                        position: 'absolute',
                        bottom: '1%',
                        left: '1%',
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
                    type="secondary"
                    icon={<PoweroffOutlined style={{ fontSize: '2vw' }} />}
                    style={{
                        position: 'absolute',
                        bottom: '1%',
                        right: '1%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '10vw',
                        height: '8vw',
                        minWidth: '60px',
                        minHeight: '40px',
                    }}
                    onClick={() => handleLogout()}
                >
                    <h2 style={{ margin: '0', fontSize: '1vw', minWidth: '10px' }}>Afmelden</h2>
                </Button>
            </div>
        </ConfigProvider>
    );
};

export default HomePage;