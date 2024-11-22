import React, { useState, useRef, useEffect } from 'react';
import { Avatar, Input, Button, ConfigProvider, Card } from 'antd';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { antThemeTokens, themes } from '../themes';
import { createClient } from "@supabase/supabase-js";
import '../CSS/ChatPage.css';


const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q")

const ChatPage = () => {
    const location = useLocation();
    const { profileData } = location.state || {};
    const { name, profilePicture } = profileData || {};
    const navigate = useNavigate();
    const [theme, setTheme] = useState('blue');
    const themeColors = themes[theme] || themes.blauw;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const { chatroomId } = useParams();
    const userEmail = localStorage.getItem('userEmail');
    console.log(userEmail);
    const userId = parseInt(localStorage.getItem('user_id'),10);
    console.log(userId);

    const dummyRef = useRef(null);

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('Messages')
            .select('id, sender_id, created_at, message_content')
            .eq('chatroom_id', chatroomId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error("Error fetching messages:", error);
            return;
        }
        console.log("Fetched messages:", data);
        setMessages(data || []);
    };

    useEffect(() => {
        fetchMessages(); // Fetch messages when chatroomId changes

        const channel = supabase
            .channel(`chatroom-${chatroomId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Messages' }, (payload) => {
                console.log('New message payload:', payload); // Check payload data
                fetchMessages(); // Fetch new messages when a new message is inserted
            })
            .subscribe();

        // Cleanup subscription when component unmounts or chatroomId changes
        return () => {
            supabase.removeChannel(channel); // Correct way to remove channel
        };
    }, [chatroomId]);

    useEffect(() => {
        if (dummyRef.current) {
            dummyRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (newMessage.trim() === "") return;

        const { error } = await supabase
            .from('Messages')
            .insert([{ chatroom_id: chatroomId, sender_id: userId, message_content: newMessage }]);

        if (error) {
            console.error("Error sending message:", error);
            return;
        }

        await supabase
            .from('Chatrooms')
            .update({ last_sender_id: userId })
            .eq('id', chatroomId);

        setNewMessage("");
        fetchMessages();
    };


    const handleProfile = () => {
        navigate('/profile');
    };

    const styles = {
        background: {
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: themeColors.primary2, // Background color for the entire screen
        },
        card: {
            width: '90%',
            maxWidth: '650px',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: themeColors.primary3, // Chatbox color
            display: 'flex',
            flexDirection: 'column',
        },
        chatContainer: {
            padding: '20px',
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
        },
        header: {
            backgroundColor: themeColors.primary6,
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '8px',
            marginBottom: '15px',
            width: '100%',
            position: 'relative',
        },
        avatar: {
            marginRight: '20px',
        },
        messageList: {
            flexGrow: 1,
            overflowY: 'auto',
            width: '100%',
            marginBottom: '15px',
            display: 'flex',
            flexDirection: 'column',
        },
        bubble: {
            maxWidth: '70%',
            padding: '10px 15px',
            borderRadius: '20px',
            wordBreak: 'break-word',
            marginBottom: '5px',
            display: 'flex',
            alignItems: 'center',
        },
        senderBubble: {
            backgroundColor: themeColors.primary1,
            color: themeColors.primary10,
            alignSelf: 'flex-end',
            display: 'flex',
            alignItems: 'center',
        },
        receiverBubble: {
            backgroundColor: themeColors.primary4,
            color: themeColors.primary10,
            alignSelf: 'flex-start',
        },
        timestamp: {
            fontSize: '12px',
            marginTop: '3px',
            alignSelf: 'flex-end',
            color: themeColors.primary8,
        },
        inputContainer: {
            display: 'flex',
            alignItems: 'center',
            marginTop: '10px',
            width: '100%',
        },
        input: {
            flex: 1,
            marginRight: '10px',
            height: '40px',
            borderRadius: '5px',
        },
        sendButton: {
            height: '40px',
            padding: '0 15px',
            borderRadius: '5px',
        },
    };

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div style={styles.background}>
                <Card style={styles.card} bordered>
                    <div style={styles.chatContainer}>
                        <div style={styles.header}>
                            <Avatar
                                src={profilePicture || 'default-avatar.png'}
                                onClick={handleProfile}
                                style={styles.avatar}
                            >
                                U
                            </Avatar>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: themeColors.primary1 }}>
                                {`${name}`}
                            </h2>
                        </div>
                        <div style={styles.messageList}>
                            {messages.map((message) => {
                                const isSender = message.sender_id === userId;
                                return (
                                    <div
                                        key={message.id}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: isSender ? 'flex-end' : 'flex-start', // Align bubble and timestamp dynamically
                                        }}
                                    >
                                        {/* Message Bubble */}
                                        <div
                                            style={{
                                                ...styles.bubble,
                                                ...(isSender ? styles.senderBubble : styles.receiverBubble),
                                            }}
                                        >
                                            <p style={{ margin: 0 }}>{message.message_content}</p>
                                        </div>
                                        {/* Timestamp */}
                                        <span
                                            style={{
                                                ...styles.timestamp,
                                                alignSelf: isSender ? 'flex-end' : 'flex-start', // Align timestamp below bubble
                                            }}
                                        >
                                            {new Date(message.created_at).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                );
                            })}
                            <div ref={dummyRef} />
                        </div>
                        <div style={styles.inputContainer}>
                            <Input
                                style={styles.input}
                                placeholder="Type hier..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onPressEnter={handleSendMessage}
                            />
                            <Button type="primary" style={styles.sendButton} onClick={handleSendMessage}>
                                Verstuur
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </ConfigProvider>
    );
};

export default ChatPage;