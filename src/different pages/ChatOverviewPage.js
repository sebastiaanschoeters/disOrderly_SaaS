import React, { useState } from 'react';
import {List, Avatar, Typography, Input, ConfigProvider, Card, Button} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { antThemeTokens, themes } from '../themes';

const { Title } = Typography;

const ChatOverviewPage = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('blauw');
    const themeColors = themes[theme] || themes.blauw;
    const [searchQuery, setSearchQuery] = useState('');

    const chats = [
        { id: 1, name: "Alice Johnson", hasNewMessage: true},
        { id: 2, name: "Bob Smith", hasNewMessage: true },
        { id: 3, name: "Carla Martin", hasNewMessage: false },
        { id: 4, name: "David Lee", hasNewMessage: false}
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
                    <Button type='primary' shape='circle' style={styles.button} icon={<CloseOutlined/>}/>
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
                        renderItem={(chat) => (
                            <Card
                                style={styles.card}
                                hoverable={true}
                                onClick={() => {
                                    if (chat.hasNewMessage) {
                                        navigate(`/chatsuggestion/${chat.name}`);
                                    } else {
                                        navigate(`/chat/${chat.name}`);
                                    }
                                }}
                            >
                                <Card.Meta
                                    avatar={<Avatar>U</Avatar>}
                                    title={<span style={styles.name}>{chat.name}</span>}
                                />

                                {chat.hasNewMessage && (
                                    <div style={styles.newMessageIndicator}>
                                        Nieuwe Berichten
                                    </div>
                                )}
                            </Card>
                        )}
                    />
                </div>
        </ConfigProvider>
);
};


export default ChatOverviewPage;