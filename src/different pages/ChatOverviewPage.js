import React, { useState,useEffect } from 'react';
import {List, Avatar, Typography, Input, ConfigProvider, Card, Button} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { antThemeTokens, themes } from '../themes';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q")

const { Title } = Typography;

const ChatOverviewPage = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('blauw');
    const themeColors = themes[theme] || themes.blauw;
    const [searchQuery, setSearchQuery] = useState('');
    const [chatrooms, setChatrooms] = useState([]);
    const userID = 1234;

    const fetchChatrooms = async () => {
        const {data, error} = await supabase
            .from('Chatroom')
            .select('id,sender_id,receiver_id,acceptance,senderProfile: sender_id(name),receiverProfile: receiver_id(name)')
            .or(`sender_id.eq.${userID},receiver_id.eq.${userID}`);

        if (error) {
            console.error("Error fetching chatrooms:", error);
        } else {
            const formattedChatrooms = data.map((chat) => {
                const senderProfile = chat.senderProfile;
                const receiverProfile = chat.receiverProfile;
                const profile = chat.sender_id === userID ? receiverProfile : senderProfile;

                return {
                    ...chat,
                    profileName: profile.name,
                    profilePicture: profile.profilePicture
                };
            });
            setChatrooms(formattedChatrooms);
        }
    };

    useEffect(() => {
        fetchChatrooms();
    }, []);

    const filteredChats = chatrooms.filter((chat) => {
        const chatName = chat.sender_id === userID
            ? `${chat.receiverProfile.name}`
            : `${chat.senderProfile.name}`;        return chatName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleSearch = (value) => {
        setSearchQuery(value);
    };
    const handleClose = () => {
        navigate('/home');
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
            padding: '0px 20px'
        },
        title: {
            flexGrow: 1,
            textAlign: 'center',
            margin: 0,
        },
        button: {
            backgroundColor: themeColors.primary8,
        },
        searchBar: {
            width: '75%',
            marginBottom: '20px',
            marginTop: '20px',
        },
        list: {
            width: '75%',
        },
        card: {
            width: '100%',
            height: '75px',
            marginBottom: '10px',
            borderRadius: '10px',
            borderWidth: '1px',
            borderColor: themeColors.primary7,
            cursor: 'pointer',
        },
        newMessageIndicator: {
            position: 'absolute',
            top: '25px',
            height: '25px',
            right: '25px',
            backgroundColor: themeColors.primary8,
            color: themeColors.primary1,
            padding: '0px 5px',
            borderRadius: '5px',
            fontSize: '14px',
        },
        name: {
            fontSize: '14px',
        }
    };

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div style={styles.chatContainer}>
                <div style={styles.titleButton}>
                    <Title level={2} style={styles.title}>Chat Overzicht</Title>
                    <Button type='primary' shape='circle' style={styles.button} icon={<CloseOutlined/>} onClick={handleClose}/>
                    </div>
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
                                        };
                                        if (chat.acceptance === true) {
                                            navigate(`/chat/${chat.id}`, { state: { profileData} });
                                        } else {
                                            navigate(`/chatsuggestion/${chat.id}`, { state: { profileData } });
                                        }
                                    }}
                                >
                                    <Card.Meta
                                        avatar={<Avatar src={chat.profilePicture || 'default-avatar.png'} />}
                                        title={<span style={styles.name}>{`${chat.profileName}`}</span>}
                                    />

                                    {isSender && !chat.acceptance && (
                                        <div style={styles.newMessageIndicator}>
                                            Bericht in behandeling
                                        </div>
                                    )}

                                    {!isSender && !chat.acceptance && (
                                        <div style={styles.newMessageIndicator}>
                                            Nieuwe Berichten
                                        </div>
                                    )}
                                </Card>
                            );
                        }}
                    />
            </div>
        </ConfigProvider>
    );
};


export default ChatOverviewPage;