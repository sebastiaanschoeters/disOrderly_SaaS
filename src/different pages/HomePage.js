import 'antd/dist/reset.css';
import '../CSS/AntDesignOverride.css';
import { antThemeTokens, ButterflyIcon, themes } from '../Extra components/themes';
import { Button, ConfigProvider, Avatar, Badge } from 'antd';
import {
    MessageOutlined,
    SearchOutlined,
    SettingOutlined,
    PoweroffOutlined,
    QuestionCircleOutlined,
    EditOutlined
} from "@ant-design/icons";
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

    const userEmail = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('user_id');
    const name = localStorage.getItem('name');
    const profile_picture = localStorage.getItem('profile_picture');
    const [newRequestCount, setNewRequestCount] = useState(0);
    const [chatroomId, setChatroomId] = useState(null);

    const fetchChatroomId = async () => {
        try {
            const { data: dataChatroom, error: fetchError } = await supabase
                .from('Chatroom')
                .select('id')
                .eq('sender_id', userId)
                .eq('receiver_id', 1)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error("Error fetching chatroom:", fetchError);
                return;
            }

            if (dataChatroom) {
                setChatroomId(dataChatroom.id);
            } else {
                const { data: newChatroom, error: insertError } = await supabase
                    .from('Chatroom')
                    .insert({
                        sender_id: userId,
                        receiver_id: 1,
                        acceptance: true,
                        last_sender_id: userId,
                    })
                    .select()
                    .single();

                if (insertError) {
                    console.error("Error inserting new chatroom:", insertError);
                    return;
                }

                setChatroomId(newChatroom.id);
            }
        } catch (error) {
            console.error("Unexpected error in fetchChatroomId:", error);
        }
    };

    const fetchnumber = async () => {
        try {
            const { count, error } = await supabase
                .from('Chatroom')
                .select('id', { count: 'exact' })
                .eq('receiver_id', userId)
                .eq('acceptance', false);

            if (error) {
                console.error("Error fetching chatrooms:", error);
                return;
            }

            if (count > 0) {
                setNewRequestCount(count || 0);
            }
        } catch (error) {
            console.error("Unexpected error in fetchnumber:", error);
        }
    };

    useEffect(() => {
        fetchnumber();
        fetchChatroomId();
    }, []);

    const handleHelpService = () => {
        const profileData = {
            name: "Helpdesk",
            user_id: userId,
            otherUserId: 1,
            isSender: true,
            chatroomId: chatroomId,
            isAdmin: true,
        };

        navigate(`/chat_overzicht/chat`, { state: { profileData } });
    };

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
                <NotificationModal />
                <ButterflyIcon color={themeColors.primary3} />

                <div style={{
                    display: 'flex',
                    rowGap: '20px',
                    columnGap: '80px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    width: '100%',
                    alignItems: 'center',
                    marginTop: '-50px'
                }}>
                    <Button
                        className="primary-button"
                        type="primary"
                        icon={<SearchOutlined style={{ fontSize: '4rem' }} />}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '240px',
                            height: '240px',
                            fontSize: '2rem',
                            textAlign: 'center',
                            overflow: 'hidden',
                        }}
                        onClick={() => navigate('/mensen_ontdekken')}
                    >
                        <h2 style={{ margin: '0', minWidth: '20px', whiteSpace: 'normal', lineHeight: '1.1', }}>Mensen ontdekken</h2>
                    </Button>
                    <Badge
                        count={newRequestCount}
                                offset={[0, 10]}
                                style={{
                                    backgroundColor: 'orange',
                                    color: 'white',
                                    fontSize: '2rem',
                                    width: '32px',
                                    height: '32px',
                                    lineHeight: '32px',
                                    borderRadius: '50%',
                                }}
                    >
                        <Button
                            className="primary-button"
                            type="primary"
                            icon={<MessageOutlined style={{ fontSize: '4rem' }} />}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '240px',
                                height: '240px',
                                fontSize: '2rem',
                                textAlign: 'center',
                                overflow: 'hidden',
                            }}
                            onClick={() => navigate('/chat_overzicht')}
                        >
                            <h2 style={{ margin: '0', minWidth: '20px', whiteSpace: 'nowrap' }}>Chats</h2>
                        </Button>
                    </Badge>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        top: '3%',
                        left: '1%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        cursor: 'pointer',
                        padding: '10px',
                    }}
                    onClick={() => navigate('/gebruiker_profiel')}
                >
                    <Avatar
                        src={profile_picture}
                        style={{
                            backgroundColor: themeColors.primary4,
                            color: themeColors.primary10,
                            height: '15vw',
                            width: '15vw',
                            maxHeight: 100,
                            maxWidth:100
                        }}
                    >
                        {name[0]}
                    </Avatar>
                    <p
                        style={{
                            color: themeColors.primary10,
                            whiteSpace: 'nowrap',
                            fontSize: '1.4rem',
                        }}
                    >
                        {name} <EditOutlined style={{marginLeft:'10px'}}/>
                    </p>
                </div>

                <Button
                    className="secondary-button"
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
                        fontSize: '1.8rem',
                        textAlign: 'center',
                        overflow: 'hidden',
                    }}
                    onClick={() => navigate('/persoonlijke_instellingen')}
                >
                    <h2 style={{ margin: '0', minWidth: '10px', whiteSpace: 'nowrap' }}>Instellingen</h2>
                </Button>

                <Button
                    className="secondary-button"
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
                        fontSize: '1.8rem',
                        textAlign: 'center',
                        overflow: 'hidden',
                    }}
                    onClick={() => handleLogout()}
                >
                    <h2 style={{ margin: '0', minWidth: '10px', whiteSpace: 'nowrap' }}>Afmelden</h2>
                </Button>

                <Button
                    className="secondary-button"
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
                    onClick={() => handleHelpService()}
                >
                    <h2 style={{ margin: '0', minWidth: '10px', whiteSpace: 'nowrap' }}>Helpdesk</h2>
                </Button>
            </div>

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
