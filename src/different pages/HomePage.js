import 'antd/dist/reset.css'; // Import Ant Design styles
import '../CSS/AntDesignOverride.css';
import { antThemeTokens, ButterflyIcon, themes } from '../Extra components/themes';
import { Button, ConfigProvider, Avatar, Badge } from 'antd';
import { MessageOutlined, SearchOutlined, SettingOutlined, PoweroffOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import React, {useState, useEffect} from "react";
import { useNavigate } from 'react-router-dom';
import NotificationModal from "./NotifiactionModal";
import useTheme from "../UseHooks/useTheme";
import useThemeOnCSS from "../UseHooks/useThemeOnCSS";
import {createClient} from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


const HomePage = () => {
    const [themeName, darkModeFlag] = JSON.parse(localStorage.getItem('theme')) || ['blauw', false];
    const {themeColors, setThemeName, setDarkModeFlag} = useTheme(themeName, darkModeFlag);

    useThemeOnCSS(themeColors);

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const userEmail = localStorage.getItem('userEmail'); // Logged-in user's email
    const userId = localStorage.getItem('user_id');
    const name = localStorage.getItem('name');
    const profile_picture = localStorage.getItem('profile_picture');
    const [newRequestCount, setNewRequestCount] = useState(0);

    const fetchnumber = async () => {
        const {count, error} = await supabase
            .from('Chatroom')
            .select('id', { count: 'exact' })
            .eq(`receiver_id`,userId)
            .eq('acceptance', false);

        if (error) {
            console.error("Error fetching chatrooms:", error);
        }
        if (count > 0){
            setNewRequestCount(count || 0);
        }
    };

    useEffect(() => {
        fetchnumber(); // Fetch the count on component mount
    }, []);

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div
                style={{
                    padding: '20px',
                    position: 'relative',
                    width: '100%',
                    height: '100dvh',
                    backgroundColor: themeColors.primary2,
                    color: themeColors.primary10,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    zIndex: '0',
                }}
            >
                {/* Always show the NotificationModal globally for logged-in users */}
                <NotificationModal />
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
                        <h2 style={{ margin: '0', minWidth: '20px', whiteSpace: 'normal', lineHeight: '1.1', }}>Mensen ontdekken</h2>
                    </Button>
                    <Badge
                        count={newRequestCount} // Dynamic count
                                offset={[0, 10]} // Adjust badge position (horizontal, vertical)
                                style={{
                                    backgroundColor: 'orange', // Badge background color
                                    color: 'white',           // Badge text color
                                    fontSize: '2rem',
                                    width: '32px',              // Width of the badge
                                    height: '32px',             // Height of the badge
                                    lineHeight: '32px',         // Line height to center the text
                                    borderRadius: '50%', // Font size for badge
                                }}
                    >
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
                    </Badge>
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
                        size={100}
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
                        bottom: '3%',
                        left: '1%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '20dvw',
                        height: '12dvh',
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
                        bottom: '3%',
                        right: '1%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '20dvw',
                        height: '12dvh',
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

                <Button
                    className="secondary-button"  // Add class for targeting with CSS
                    type="secondary"
                    icon={<QuestionCircleOutlined />}
                    style={{
                        position: 'absolute',
                        top: '3%',
                        right: '1%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '20dvw',
                        height: '12dvh',
                        minWidth: '100px',
                        minHeight: '80px',
                        fontSize: '1.8rem',
                        textAlign: 'center',
                        overflow: 'hidden',
                    }}
                    //onClick={() => handleLogout()}
                >
                    <h2 style={{ margin: '0', minWidth: '10px', whiteSpace: 'nowrap' }}>Helpdesk</h2>
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
                    height: 100% dvh;
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
