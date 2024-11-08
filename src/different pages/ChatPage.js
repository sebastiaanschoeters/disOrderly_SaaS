import React, { useState, useRef , useEffect } from 'react';
import { Avatar, Input, Button, Typography, ConfigProvider } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { antThemeTokens, themes } from '../themes';
import { CloseOutlined } from '@ant-design/icons';
import '../CSS/ChatPage.css';

const { Title } = Typography;

const sampleMessages = [
    { text: "Hey! Alles goed?", sender: "Alice", timestamp: "10:15" },
    { text: "Ja hoor, met mij is alles goed en met jou?", sender: "Me", timestamp: "10:16" },
    { text: "Met mij ook goed?", sender: "Alice", timestamp: "10:17" },
    { text: "Hoe zit het met hobbies?", sender: "Alice", timestamp: "10:17" },
    { text: "Ik speel graag voetbal en kijk veel films, jij?", sender: "Me", timestamp: "10:18" },
    { text: "Ik kijk ook graag films, welk is jouw favoriet", sender: "Alice", timestamp: "10:19" },
    { text: "Harry Potter natuurlijk", sender: "Me", timestamp: "10:20" },
    { text: "Ah ja, Harry Potter is inderdaad erg goed, nog andere?", sender: "Alice", timestamp: "10:21" },
    { text: "Uhm, Spider-man en Forrest Gump", sender: "Me", timestamp: "10:22" },
    { text: "Beide zijn erg leuk ja", sender: "Alice", timestamp: "10:23" },
    { text: "En jij?", sender: "Me", timestamp: "10:24" },
];

const ChatPage = () => {
    const { name } = useParams();
    const navigate = useNavigate();
    const [theme, setTheme] = useState('blue');
    const themeColors = themes[theme] || themes.blauw;
    const [messages, setMessages] = useState(sampleMessages);
    const [newMessage, setNewMessage] = useState('');

    const dummyRef = useRef(null);

    const handleSendMessage = () => {
        if (newMessage.trim() !== '') {
            const newMessages = [
                ...messages,
                { text: newMessage, sender: 'Me', timestamp: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}` },
            ];
            setMessages(newMessages);
            setNewMessage('');
        }
    };

    const handleCloseChat = () => {
        navigate('/chatoverview');
    };

    const handleProfile = () => {
        navigate('/profile');
    };


    useEffect(() => {
        if (dummyRef.current) {
            dummyRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [messages]);

    const styles = {
        chatContainer: {
            padding: '20px',
            width: '100%',
            height: '100vh',
            backgroundColor: themeColors.primary2,
            color: themeColors.primary10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
        },
        header: {
            backgroundColor: themeColors.primary6,
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '8px',
            marginBottom: '15px',
            position: 'relative',
        },
        headerAvatar: {
            marginRight: '10px',
            color: '#fff',
            cursor: 'pointer',
        },
        closeButton: {
            position: 'absolute',
            right: '10px',
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
        },
        messageList: {
            flexGrow: 1,
            overflowY: 'auto',
            marginBottom: '15px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
        },
        messageItem: {
            marginBottom: '15px',
            padding: '8px 12px',
            borderRadius: '15px',
            maxWidth: '50%',
            display: 'inline-block',
            wordBreak: 'break-word',
            position: 'relative',
        },
        messageSender: {
            backgroundColor: themeColors.primary1,
            alignSelf: 'flex-end',
            borderTopRightRadius: '0',
            marginLeft: 'auto',
        },
        messageReceiver: {
            backgroundColor: themeColors.primary4,
            alignSelf: 'flex-start',
            borderTopLeftRadius: '0',
        },
        inputContainer: {
            display: 'flex',
            alignItems: 'center',
        },
        input: {
            flexGrow: 1,
            marginRight: '10px',
        },
        timestamp: {
            fontSize: '12px',
            color: themeColors.primary6,
            position: 'absolute',
            bottom: '-15px',
            right: '10px',
        }
    };

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div style={styles.chatContainer}>
                <div style={styles.header}>
                    <Avatar  size="large" onClick={handleProfile}>U</Avatar>
                    <Title level={4} style={{ margin: 0, color: themeColors.primary1 }}>{name}</Title>
                    <button style={styles.closeButton} onClick={handleCloseChat}>
                        <CloseOutlined />
                    </button>
                </div>
                <div style={styles.messageList}>
                    {messages.map((message, index) => (
                        <div key={index} style={{
                            ...styles.messageItem,
                            ...(message.sender === 'Me' ? styles.messageSender : styles.messageReceiver),
                            alignSelf: message.sender === 'Me' ? 'flex-end' : 'flex-start',
                        }}>
                            {message.text}
                            <div style={styles.timestamp}>{message.timestamp}</div>
                        </div>
                    ))}
                    <div ref={dummyRef}/>
                </div>
                <div style={styles.inputContainer}>
                    <Input
                        style={styles.input}
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onPressEnter={handleSendMessage}
                    />
                    <Button type="primary" onClick={handleSendMessage}>Send</Button>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default ChatPage;