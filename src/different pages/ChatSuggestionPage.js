import React, {useEffect, useState} from 'react';
import { Avatar, Button, Typography, ConfigProvider } from 'antd';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import { CloseOutlined } from '@ant-design/icons';
import { themes, antThemeTokens } from '../themes';
import '../CSS/ChatSuggestionPage.css';
import { createClient } from "@supabase/supabase-js";


const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q")


const { Title } = Typography;

const ChatSuggestionPage = () => {
    const location = useLocation();
    const { profileData} = location.state || {};
    const { name, profilePicture, user_id, otherUserId, isSender } = profileData || {};
    const { chatroomId } = useParams();
    const navigate = useNavigate();
    const theme = 'blue';
    const [Message, setMessage] = useState("");
    const themeColors = themes[theme] || themes.blauw;

    const fetchMessages = async (chatroomId) => {
        const { data, error } = await supabase
            .from('Messages')
            .select('message_content')
            .eq('chatroom_id', chatroomId)
            .single();

        if (error) {
            console.error("Error fetching messages:", error);
            return;
        }

        setMessage(data.message_content);
    };

    const updateAcceptance = async (chatroomId, newAcceptanceValue) => {
        const { data, error } = await supabase
            .from('Chatroom') // Table name
            .update({ acceptance: newAcceptanceValue }) // Column to update
            .eq('id', chatroomId); // Condition: Match the row by id

        if (error) {
            console.error("Error updating acceptance:", error);
        } else {
            console.log("Update successful:", data);
        }
    };

    const deleteMessages = async (chatroomId) => {
        const { data, error } = await supabase
            .from('Messages')
            .delete()
            .eq('chatroom_id', chatroomId);

        if (error) {
            console.error("Error deleting messages:", error);
            return;
        }

        console.log('Messages deleted:');
    };

    const deleteChatroom = async (chatroomId) => {
        const { data, error } = await supabase
            .from('Chatroom')
            .delete()
            .eq('id', chatroomId);

        if (error) {
            console.error('Error deleting chatroom:');
            return;
        }

        console.log('Chatroom deleted:');
    };

    const insertBlocked = async () => {
        const { data, error } = await supabase
            .from('Blocked list')
            .insert([
                {
                    user_id: user_id,
                    blocked_id: otherUserId,
                    chatroom_id: chatroomId,
                    blocked: true
                }
            ]);

        if (error) {
            console.error("Error updating blocked status:", error);
        } else {
            console.log("Blocked status updated successfully:", data);
            navigate('/chatOverview'); // Redirect to chat overview after successful block
        }
    };

    useEffect(() => {
        fetchMessages(chatroomId);
    }, [chatroomId]);

    const styles = {
        container: {
            padding: '20px',
            width: '100%',
            height: '100vh',
            backgroundColor: themeColors.primary2,
            color: themeColors.primary10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
        },
        header: {
            backgroundColor: themeColors.primary6,
            width: '75%',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '8px',
            marginBottom: '15px',
            position: 'relative',
        },
        headerAvatar: {
            marginRight: '10px',
            cursor: 'pointer',
            fontSize: '1rem',
        },
        closeButton: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            cursor: 'pointer',
        },
        messageContainer: {
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: themeColors.primary4,
            color: themeColors.primary10,
            marginBottom: '20px',
            width: '75%',
        },
        buttonContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            width: '75%',
        },
        button:{
            margin: '0 5px',
            flex: 1,
            maxWidth: '250px',
        }
    };

    const handleProfile = () => {
        navigate('/profile');
    };

    const handleAccept = () => {
        updateAcceptance(chatroomId, true);
        navigate(`/chat/${chatroomId}`, { state: { profileData} });
    };

    const handleDecline = () => {
        deleteMessages(chatroomId);
        deleteChatroom(chatroomId);
        navigate('/chatOverview');
    };

    const handleBlock = () => {
        insertBlocked();
        navigate('/chatOverview');
    };

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <Avatar src={profilePicture || 'default-avatar.png'} onClick={handleProfile} style={styles.headerAvatar}>U</Avatar>
                    <Title level={2} style={{ margin: 0, color: themeColors.primary10 }}h2>{`${name}`}</Title>
                    <Button type='primary' shape='circle' style={styles.closeButton} icon={<CloseOutlined/>} onClick={() => navigate('/chatOverview')}/>
                </div>
                <div style={styles.messageContainer}>
                    <p>{Message}</p>
                </div>
                <div style={styles.buttonContainer}>
                    {!isSender && (
                        <>
                            <Button className="ant-btn-accept" style={styles.button} onClick={handleAccept}>Accepteer</Button>
                            <Button className="ant-btn-decline" style={styles.button} onClick={handleDecline}>Weiger</Button>
                            <Button className="ant-btn-block" style={styles.button} onClick={handleBlock}>Blokkeer</Button>

                        </>
                    )}
                </div>
            </div>
        </ConfigProvider>
    );
};

export default ChatSuggestionPage;