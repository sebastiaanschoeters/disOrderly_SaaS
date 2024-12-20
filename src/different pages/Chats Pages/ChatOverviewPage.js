import React, { useState, useEffect } from 'react';
import { List, Avatar, Typography, Input, ConfigProvider, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { antThemeTokens, ButterflyIcon } from '../../Extra components/themes';
import { createClient } from "@supabase/supabase-js";
import moment from 'moment';
import useTheme from "../../UseHooks/useTheme";
import useThemeOnCSS from "../../UseHooks/useThemeOnCSS";
import BreadcrumbComponent from "../../Extra components/BreadcrumbComponent";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabaseSchema = process.env.REACT_APP_SUPABASE_SCHEMA;
const supabase = createClient(supabaseUrl, supabaseKey, {db: {schema: supabaseSchema}});

const ChatOverviewPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [chatrooms, setChatrooms] = useState([]);
    const userID = parseInt(localStorage.getItem('user_id'), 10);
    const userType = localStorage.getItem('userType');

    const [themeName, darkModeFlag] = JSON.parse(localStorage.getItem('theme')) || ['blauw', false];
    const { themeColors } = useTheme(themeName, darkModeFlag);

    useThemeOnCSS(themeColors);

    const fetchChatrooms = async () => {
        let data, error;
        if (userType !== "admin") {
            ({ data, error } = await supabase
                .from('Chatroom')
                .select(`id, sender_id, receiver_id, acceptance, last_sender_id,
                senderProfile: sender_id(name, profile_picture), 
                receiverProfile: receiver_id(name, profile_picture)`)
                .or(`sender_id.eq.${userID},receiver_id.eq.${userID}`)
                .not('receiver_id', 'eq', 1));
        } else {
            ({ data, error } = await supabase
                .from('Chatroom')
                .select(`id, sender_id, receiver_id, acceptance, last_sender_id,
                senderProfile: sender_id(name, profile_picture), 
                receiverProfile: receiver_id(name, profile_picture)`)
                .or(`sender_id.eq.${userID},receiver_id.eq.${userID}`));
        }

        if (error) {
            console.error("Error fetching chatrooms:", error);
            return;
        }

        const updatedChatrooms = await Promise.all(data.map(async (chat) => {
            const { data: lastMessage, error: messageError } = await supabase
                .from('Messages')
                .select('message_content, created_at')
                .eq('chatroom_id', chat.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (messageError) {
                console.error(`Error fetching last message for chatroom ${chat.id}:`, messageError);
                return { ...chat, last_message: '', last_message_time: null };
            }

            const lastMessageParse = (message) => {
                const truncate = (str) => {
                    const maxLength = 12
                    return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
                };

                if(message.startsWith("ButterflyIcon")) {
                    const contentAfterIcon = message.slice(13).trim();

                    const indexMatch = contentAfterIcon.match(/^(\d+)\s*(.*)$/);
                    const title = indexMatch ? indexMatch[2] : "";

                    const [mainTitle, extraContent] = title.split('!').map(part => part.trim());
                    return truncate(mainTitle);

                } else {
                    return truncate(message);
                }
            }

            return {
                ...chat,
                last_message: lastMessageParse(lastMessage?.message_content) || '',
                last_message_time: lastMessage?.created_at || null,
            };
        }));

        const filteredChatrooms = updatedChatrooms.filter(
            (chat) => chat.last_message_time && chat.last_message
        );

        const formattedChatrooms = filteredChatrooms.map((chat) => {
            const senderProfile = chat.senderProfile;
            const receiverProfile = chat.receiverProfile;
            const profile = chat.sender_id === userID ? receiverProfile : senderProfile;

            return {
                ...chat,
                profileName: profile.name,
                profilePicture: profile.profile_picture,
            };
        }).sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));
        console.log(formattedChatrooms)

        setChatrooms(formattedChatrooms);
    };


    useEffect(() => {
        fetchChatrooms();
    }, []);

    const filteredChats = chatrooms.filter((chat) => {
        const chatName = chat.profileName;
        return chatName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleSearch = (value) => {
        setSearchQuery(value);
    };

    const styles = {
        chatContainer: {
            padding: '20px',
            width: '100%',
            height: '100vh',
            backgroundColor: themeColors.primary2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflowY: 'auto',
        },
        titleButton: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '0px 20px',
        },
        title: {
            flexGrow: 1,
            textAlign: 'center',
            margin: 0,
        },
        searchBar: {
            width: '75%',
            maxWidth: '600px',
            marginBottom: '20px',
            marginTop: '20px',
            fontSize: '1rem',
        },
        list: {
            width: '75%',
            maxWidth: '600px',
        },
        card: {
            width: '100%',
            height: '100px',
            marginBottom: '10px',
            borderRadius: '10px',
            borderWidth: '1px',
            borderColor: themeColors.primary7,
            cursor: 'pointer',
        },
        lastMessage: {
            fontSize: '0.9rem',
            color: themeColors.primary9,
            marginTop: '5px',
        },
        name: {
            fontSize: '1.2rem',
        },
        newMessageIndicator: {
            position: 'absolute',
            top: '15px',
            height: '25px',
            right: '15px',
            backgroundColor: themeColors.primary8,
            color: themeColors.primary1,
            padding: '0px 5px',
            borderRadius: '5px',
            fontSize: '1rem',
        },
        timeContainer: {
            position: 'absolute',
            bottom: '5px', // Adjust as needed
            right: '5px',  // Adjust as needed
            fontSize: '0.8rem',
            color: '#888', // Lighter text color for subtlety
        },
    };

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div
                style={{
                    ...styles.chatContainer,
                    position: 'relative',
                    zIndex: '0',
                }}

            >
                <ButterflyIcon color={themeColors.primary3} />

                {userType !== "admin" &&<BreadcrumbComponent />}

                <Input.Search
                    placeholder="Zoek in chats..."
                    style={styles.searchBar}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onSearch={handleSearch}
                    enterButton={false}
                    allowClear
                />
                <List
                    itemLayout="horizontal"
                    style={styles.list}
                    dataSource={filteredChats}
                    renderItem={(chat) => {
                        const otherUserId = chat.sender_id === userID ? chat.receiver_id : chat.sender_id;
                        const isSender = chat.sender_id === userID;
                        return (

                            <Card
                                style={styles.card}
                                hoverable={true}
                                onClick={() => {
                                    const profileData = {
                                        name: chat.profileName,
                                        profilePicture: chat.profilePicture,
                                        user_id: userID,
                                        otherUserId: otherUserId,
                                        isSender: isSender,
                                        chatroomId: chat.id,
                                    };
                                    if (chat.acceptance === true) {
                                        navigate('/chat_overzicht/chat', { state: { profileData } });
                                    } else {
                                        navigate('/chat_overzicht/nieuwe_chat', { state: { profileData } });
                                    }
                                }}
                            >
                                <Card.Meta
                                    avatar={<Avatar src={chat.profilePicture || 'default-avatar.png'} style={{width: '65px', height: '65px'}}/>}
                                    title={
                                        <span style={styles.name}>
                                            <span style={{ fontWeight: chat.last_sender_id !== userID ? 'bold' : 'normal' }}>{chat.profileName}</span>
                                        </span>
                                    }
                                    description={
                                    <>
                                        <span style={styles.lastMessage}>
                                            {chat.last_sender_id === userID && (
                                                "jij: "
                                            )}
                                            {chat.last_message}
                                        </span>
                                        <div style={styles.timeContainer}>
                                            {
                                                (() => {
                                                    const messageTime = moment(chat.last_message_time); // Convert string to moment object
                                                    const today = moment();

                                                    // If the message was sent today, show only the time
                                                    if (messageTime.isSame(today, 'day')) {
                                                        return <i>{messageTime.format('HH:mm')}</i>; // Display time in HH:mm format and italic
                                                    } else {
                                                        return <i>{messageTime.format('DD-MM')}</i>; // Display the date in DD-MM format and italic
                                                    }
                                                })()
                                            }
                                        </div>
                                    </>
                                    }
                                />

                                {isSender && !chat.acceptance && (
                                    <div style={styles.newMessageIndicator}>Wachten</div>
                                )}
                                {!isSender && !chat.acceptance && (
                                    <div style={styles.newMessageIndicator}>Nieuw</div>
                                )}
                            </Card>
                        );
                    }}
                >
                    {filteredChats.length === 0 && (
                        <div style={{ textAlign: 'center', marginTop: '20px', color: themeColors.primary9 }}>
                            Geen chats gevonden.
                        </div>
                    )}
                </List>
            </div>
        </ConfigProvider>
    );
};

export default ChatOverviewPage;