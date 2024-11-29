import React, { useState, useRef, useEffect } from 'react';
import { Avatar, Input, Button, ConfigProvider, Card } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { antThemeTokens, themes } from '../themes';
import {ArrowDownOutlined} from '@ant-design/icons';
import { createClient } from "@supabase/supabase-js";
import '../CSS/ChatPage.css';


const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q")

const ChatPage = () => {
    const location = useLocation();
    const { profileData } = location.state || {};
    const { name, profilePicture, chatroomId, otherUserId } = profileData || {};
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const userId = parseInt(localStorage.getItem('user_id'), 10);
    const localTime = new Date();

    const [themeName, darkModeFlag] = JSON.parse(localStorage.getItem('theme')) || ['blauw', false];
    const [themeColors, setThemeColors] = useState(themes[themeName] || themes.blauw);
    useEffect(() => {
        if (darkModeFlag){
            setThemeColors(themes[`${themeName}_donker`] || themes.blauw_donker)
        }
        else{
            setThemeColors(themes[themeName] || themes.blauw);
        }
    }, [themeName, darkModeFlag]);

    const dummyRef = useRef(null);
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(true); // Track if at bottom
    const messageListRef = useRef(null);


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
        fetchMessages(); // Initial fetch when the component mounts

        // Set interval to fetch messages every 1 second
        const intervalId = setInterval(() => {
            fetchMessages();
        }, 1000);

        // Cleanup interval on component unmount or chatroomId change
        return () => {
            clearInterval(intervalId);
        };
    }, [chatroomId]); // Re-run the effect when chatroomId changes

    useEffect(() => {
        if (isScrolledToBottom) {
            scrollToBottom(); // Scroll only if user is near bottom
        }
    }, [messages]);

    const handleScroll = () => {
        if (messageListRef.current) {
            const isAtBottom =
                messageListRef.current.scrollHeight - messageListRef.current.scrollTop <=
                messageListRef.current.clientHeight + 50; // Allow a small offset (50px)

            setIsScrolledToBottom(isAtBottom);
        }
    };

    const scrollToBottom = () => {
        if (dummyRef.current) {
            dummyRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() === "") return;

        const { error } = await supabase
            .from('Messages')
            .insert([{ chatroom_id: chatroomId, sender_id: userId, message_content: newMessage,  created_at: localTime.toISOString() }]);

        if (error) {
            console.error("Error sending message:", error);
            return;
        }

        await supabase
            .from('Chatroom')
            .update({ last_sender_id: userId })
            .eq('id', chatroomId);

        setNewMessage("");


        setTimeout(() => {
            scrollToBottom();
        }, 100);
    };

    // Function to group messages by date
    const groupMessagesByDate = (messages) => {
        return messages.reduce((groups, message) => {
            const date = new Date(message.created_at).toLocaleDateString('nl-NL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(message);
            return groups;
        }, {});
    };

    const groupedMessages = groupMessagesByDate(messages);

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
            fontSize: '1rem',
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
        scrollButton: {
            position: 'absolute',
            bottom: '100px',
            left: '47%',
            backgroundColor: themeColors.primary8,
            color: themeColors.primary1,
            display: isScrolledToBottom ? 'none' : 'flex',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
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
                                style={styles.avatar}
                                onClick={() => navigate(`/profile`, { state: { user_id: otherUserId} })}
                            >
                                U
                            </Avatar>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: themeColors.primary1 }}>
                                {`${name}`}
                            </h2>
                        </div>
                        <div style={styles.messageList} ref={messageListRef} onScroll={handleScroll}>
                            {Object.keys(groupedMessages).map((date) => (
                                <div key={date}>
                                    <div style={{ textAlign: 'center', margin: '10px 0', color: themeColors.primary8 }}>
                                        <strong>{date}</strong>
                                    </div>
                                    {groupedMessages[date].map((message) => {
                                        const isSender = message.sender_id === userId;
                                        return (
                                            <div
                                                key={message.id}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: isSender ? 'flex-end' : 'flex-start',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        ...styles.bubble,
                                                        ...(isSender ? styles.senderBubble : styles.receiverBubble),
                                                    }}
                                                >
                                                    <p style={{ margin: 0 }}>{message.message_content}</p>
                                                </div>
                                                <span style={{
                                                    ...styles.timestamp,
                                                    alignSelf: isSender ? 'flex-end' : 'flex-start',
                                                }}>
                                                    {new Date(message.created_at).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                            <Button
                                style={styles.scrollButton}
                                onClick={scrollToBottom}
                                icon={<ArrowDownOutlined />}
                                hidden={isScrolledToBottom}
                            />
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