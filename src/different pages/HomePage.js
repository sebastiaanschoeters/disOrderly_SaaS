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
        localStorage.clear();
        navigate('/login');
    };

    const userEmail = localStorage.getItem('userEmail'); // Logged-in user's email
    const userId = localStorage.getItem('user_id');
    const name = localStorage.getItem('name');
    const profile_picture = localStorage.getItem('profile_picture');

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
                    rowGap: '20px', // Vertical gap between stacked buttons
                    columnGap: '80px', // Horizontal gap between buttons
                    flexWrap: 'wrap', // Allows buttons to wrap to the next line on smaller screens
                    justifyContent: 'center',
                    width: '100%',
                    alignItems: 'center', // Keep buttons centered vertically when stacked
                    marginTop: '-50px'
                }}>
                    <Button
                        className="primary-button"  // Add class for targeting with CSS
                        type="primary"
                        icon={<SearchOutlined style={{ fontSize: '4rem' }} />}  // Increase icon size
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '240px',
                            height: '240px',
                            fontSize: '2rem',
                            textAlign: 'center',  // Ensure text is centered
                            overflow: 'hidden',   // Prevent text overflow
                        }}
                        onClick={() => navigate('/search')}
                    >
                        <h2 style={{ margin: '0', minWidth: '20px', whiteSpace: 'nowrap' }}>Mensen vinden</h2>
                    </Button>

                    <Button
                        className="primary-button"  // Add class for targeting with CSS
                        type="primary"
                        icon={<MessageOutlined style={{ fontSize: '4rem' }} />}  // Increase icon size
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '240px',
                            height: '240px',
                            fontSize: '2rem',
                            textAlign: 'center',  // Ensure text is centered
                            overflow: 'hidden',   // Prevent text overflow
                        }}
                        onClick={() => navigate('/chatoverview')}
                    >
                        <h2 style={{ margin: '0', minWidth: '20px', whiteSpace: 'nowrap' }}>Chats</h2>
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
                        src={profile_picture}
                        style={{
                            backgroundColor: themeColors.primary4,
                            color: themeColors.primary10,
                        }}
                    >
                        {name[0]}
                    </Avatar>
                    <p
                        style={{
                            color: themeColors.primary10,
                            whiteSpace: 'nowrap',
                            fontSize: '1.4rem',  // Increase font size for name
                        }}
                    >
                        {name}
                    </p>
                </div>

                <Button
                    className="secondary-button"  // Add class for targeting with CSS
                    type="secondary"
                    icon={<SettingOutlined />}
                    style={{
                        position: 'absolute',
                        bottom: '1%',
                        left: '1%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '15vw',
                        height: '12vw',
                        minWidth: '100px',
                        minHeight: '80px',
                        fontSize: '1.8rem',  // Increase text size for "Instellingen"
                        textAlign: 'center',
                        overflow: 'hidden',
                    }}
                    onClick={() => navigate('/profilePersonal')}
                >
                    <h2 style={{ margin: '0', minWidth: '10px', whiteSpace: 'nowrap' }}>Instellingen</h2>
                </Button>

                <Button
                    className="secondary-button"  // Add class for targeting with CSS
                    type="secondary"
                    icon={<PoweroffOutlined />}
                    style={{
                        position: 'absolute',
                        bottom: '1%',
                        right: '1%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '15vw',
                        height: '12vw',
                        minWidth: '100px',
                        minHeight: '80px',
                        fontSize: '1.8rem',  // Increase text size for "Afmelden"
                        textAlign: 'center',
                        overflow: 'hidden',
                    }}
                    onClick={() => handleLogout()}
                >
                    <h2 style={{ margin: '0', minWidth: '10px', whiteSpace: 'nowrap' }}>Afmelden</h2>
                </Button>
            </div>

            {/* External CSS with Media Query */}
            <style>{`
                .primary-button {
                    width: 240px;
                    height: 240px;
                    font-size: 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* Media Query for Smaller Screens */
                @media (max-width: 768px) {
                    .primary-button {
                        width: 180px !important;  /* 25% smaller width */
                        height: 180px !important; /* 25% smaller height */
                        font-size: 1.5rem !important;  /* 25% smaller font size */
                    }
                    
                    .secondary-button {
                        width: 130px !important;  /* Adjust for secondary button width */
                        height: 130px !important; /* Adjust for secondary button height */
                        font-size: 1.4rem !important;  /* Adjust font size */
                    }

                    .secondary-button h2 {
                        font-size: 1rem !important;  /* Scale down font size for secondary buttons */
                        white-space: nowrap;  /* Prevent text from wrapping */
                        overflow: hidden;  /* Prevent overflow */
                    }
                }

                .primary-button h2 {
                    margin: 0;
                    font-size: inherit;
                    text-align: center;
                    overflow: hidden; /* Prevent text overflow */
                    white-space: nowrap; /* Prevent text from wrapping */
                }

                .secondary-button h2 {
                    margin: 0;
                    font-size: inherit;
                    text-align: center;
                    overflow: hidden;
                    white-space: nowrap;
                }
                /* Prevent scrolling */
                html, body {
                    overflow: hidden;
                    height: 100%;
                    margin: 0;
                }

                /* Container styles to ensure content fits within the viewport */
                #root {
                    height: 100%; /* Ensure the app takes the full viewport height */
                }
            `}</style>
        </ConfigProvider>
    );
};

export default HomePage;
