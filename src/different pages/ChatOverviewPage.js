import React, { useState } from 'react';
import { List, Avatar, Typography, Input, ConfigProvider, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { antThemeTokens, themes } from '../themes';

const { Title } = Typography;

const ChatOverviewPage = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('blauw');
    const themeColors = themes[theme] || themes.blauw;
    const [searchQuery, setSearchQuery] = useState('');

    const chats = [
        { id: 1, name: "Alice Johnson", profilePicture: "https://example.com/images/alice.jpg", lastMessage: "Hey! Hoe gaat het", timestamp: "10:15 AM" , hasNewMessage: true},
        { id: 2, name: "Bob Smith", profilePicture: "https://example.com/images/bob.jpg", lastMessage: "Wat zijn je hobbies", timestamp: "9:47 AM", hasNewMessage: false },
        { id: 3, name: "Carla Martin", profilePicture: "https://example.com/images/carla.jpg", lastMessage: "Zeker, ik zal er zijn.", timestamp: "Gisteren", hasNewMessage: false },
        { id: 4, name: "David Lee", profilePicture: "https://example.com/images/david.jpg", lastMessage: "Hoi", timestamp: "11:05 AM" , hasNewMessage: false}
    ];

    const filteredChats = chats.filter((chat) =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearch = (value) => {
        setSearchQuery(value);
    };

    const styles = {
        chatContainer: {
            padding: '20px',
            position: 'relative',
            width: '100%',
            height: '100vh',
            backgroundColor: themeColors.primary2,
            color: themeColors.primary10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflowY: 'auto',
        },
        searchBar: {
            width: '75%',
            marginBottom: '20px',
        },
        chatItem: {
            width: '100%',
            marginBottom: '15px',
            padding: '8px 10px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            cursor: 'pointer',
        },
        chatItemHover: {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            transform: 'scale(1.02)',
        },
        newMessageIndicator: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'red',
            color: '#fff',
            padding: '2px 5px',
            borderRadius: '5px',
            fontSize: '12px',
        },
        timestamp: {
            color: themeColors.primary6,
            fontSize: '12px',
        },
        name: {
            fontSize: '14px',
        },
        lastMessage: {
            fontSize: '12px',
            color: themeColors.primary8,
        }
    };

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div style={styles.chatContainer}>
                <Title level={2}>Chat Overzicht</Title>
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
                    dataSource={filteredChats}
                    style={{ width: '75%' }}
                    renderItem={(chat) => (
                        <Card
                            style={styles.chatItem}
                            onClick={() => {
                                // Navigate based on the presence of a new message
                                if (chat.hasNewMessage) {
                                    navigate('/chatsuggestion/${chat.name}'); // Go to ChatSuggestion page for new messages
                                } else {
                                    navigate(`/chat/${chat.name}`); // Go to the specific chat for existing chats
                                }
                            }}
                            hoverable
                            bodyStyle={{ padding: '5px', display: 'flex', alignItems: 'center' }}
                            className="chat-card"
                        >
                            <List.Item.Meta
                                avatar={<Avatar src={chat.profilePicture} />}
                                title={<span style={styles.name}>{chat.name}</span>}
                                description={<span style={styles.lastMessage}>{chat.lastMessage}</span>}
                            />

                            {chat.hasNewMessage && (
                                <div style={styles.newMessageIndicator}>
                                    Nieuwe Berichten
                                </div>
                            )}
                            <div style={styles.timestamp}>{chat.timestamp}</div>
                        </Card>
                    )}
                />
            </div>
        </ConfigProvider>
    );
};


export default ChatOverviewPage;