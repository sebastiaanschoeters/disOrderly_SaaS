import React, { useState, useRef , useEffect } from 'react';
import {Avatar, Input, Button, ConfigProvider, message} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { antThemeTokens, themes } from '../themes';
import { CloseOutlined } from '@ant-design/icons';
import { createClient } from "@supabase/supabase-js";
import '../CSS/ChatPage.css';


const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q")

const ChatPage = () => {
    const { name } = useParams();
    const navigate = useNavigate();
    const [theme, setTheme] = useState('blue');
    const themeColors = themes[theme] || themes.blauw;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const chatroomId = 4;
    const senderId = 1234;
    const receiverId = 1547;

    const dummyRef = useRef(null);

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('id, sender, created_at, messageContent')
            .eq('chatroom', chatroomId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error("Error fetching messages:", error);
            return;
        }

        setMessages(data || []);
    }

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        if (dummyRef.current) {
            dummyRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (newMessage.trim() === "") return;

        const { error } = await supabase
            .from("messages")
            .insert([{ chatroom: chatroomId, sender: senderId, messageContent: newMessage }]);

        if (error) {
            console.error("Error sending message:", error);
            return;
        }

        setNewMessage("");
        setMessages(prevMessages => [
            ...prevMessages,
            { id: Date.now(), sender: senderId, messageContent: newMessage, created_at: new Date() }
        ]);
        fetchMessages();
    };

    const handleCloseChat = () => {
        navigate('/chatoverview');
    };

    const handleProfile = () => {
        navigate('/profile');
    };

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
        closeButton: {
            position: 'absolute',
            right: '10px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
        },
        messageList: {
            flexGrow: 1,
            overflowY: 'auto',
            marginBottom: '15px',
            display: 'flex',
            flexDirection: 'column',
        },
        messageItem: {
            marginBottom: '15px',
            padding: '8px 12px',
            borderRadius: '15px',
            maxWidth: '50%',
            wordBreak: 'break-word',
            position: 'relative',
        },
        messageSender: {
            backgroundColor: themeColors.primary1,
            alignSelf: 'flex-end',
            borderTopRightRadius: '0',
            color: themeColors.primary10,
        },
        messageReceiver: {
            backgroundColor: themeColors.primary4,
            alignSelf: 'flex-start',
            borderTopLeftRadius: '0',
            color: themeColors.primary10,
        },
        timestamp: {
            fontSize: '12px',
            position: 'absolute',
            bottom: '-15px',
            right: '10px',
            color: themeColors.primary8,
        }
    };

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div style={styles.chatContainer}>
                <div style={styles.header}>
                    <Avatar size="large" onClick={handleProfile}>U</Avatar>
                    <h2 style={{ margin: 0, fontSize: '2rem', color: themeColors.primary1 }}>{name}</h2>
                    <button style={styles.closeButton} onClick={handleCloseChat}>
                        <CloseOutlined />
                    </button>
                </div>
                <div style={styles.messageList}>
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            style={{
                                ...styles.messageItem,
                                ...(message.sender === senderId ? styles.messageSender : styles.messageReceiver)
                            }}
                        >
                            <p>{message.messageContent}</p>
                            <span style={styles.timestamp}>
                                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                    <div ref={dummyRef} />
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
