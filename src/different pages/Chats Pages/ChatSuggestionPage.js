import React, {useEffect, useState} from 'react';
import { Avatar, Button, Modal, Input, Typography, ConfigProvider } from 'antd';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {themes, antThemeTokens, ButterflyIcon} from '../../Extra components/themes';
import '../../CSS/ChatSuggestionPage.css';
import { createClient } from "@supabase/supabase-js";
import HomeButtonUser from "../../Extra components/HomeButtonUser";
import useTheme from "../../UseHooks/useTheme";
import useThemeOnCSS from "../../UseHooks/useThemeOnCSS";
import ProfileDetailsModal from "../Profile Pages/ProfileDetailsModal";
import {handleModalProfileClose, handleProfileClick} from "../../Api/Utils";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { Title } = Typography;

const ChatSuggestionPage = () => {
    const location = useLocation();
    const { profileData} = location.state || {};
    const { name, profilePicture, otherUserId, isSender, chatroomId } = profileData || {};
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editedMessage, setEditedMessage] = useState('');
    const userId = localStorage.getItem('user_id');

    const [themeName, darkModeFlag] = JSON.parse(localStorage.getItem('theme')) || ['blauw', false];
    const { themeColors, setThemeName, setDarkModeFlag } = useTheme(themeName, darkModeFlag);

    const [isModalProfileVisible, setIsModalProfileVisible] = useState(false);
    const [selectedClient, setSelectedClient] = useState({});

    useThemeOnCSS(themeColors);

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

    const updateMessage = async (chatroomId, newContent) => {
        const { data, error } = await supabase
            .from('Messages')
            .update({ message_content: newContent })
            .eq('chatroom_id', chatroomId);

        if (error) {
            console.error('Error updating message:', error);
            return;
        }

        console.log('Message updated:', data);
        setMessage(newContent);
    };

    const insertBlocked = async () => {
        const { data, error } = await supabase
            .from('Blocked list')
            .insert([
                {
                    user_id: userId,
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
            height: '100dvh',
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
            cursor: 'pointer',
        },
        headerAvatar: {
            marginRight: '10px',
            cursor: 'pointer',
            fontSize: '1rem',
        },
        messageContainer: {
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: themeColors.primary4,
            color: themeColors.primary10,
            marginBottom: '20px',
            width: '75%',
        },
        button:{
            flex: 1,
            width: '75%',
        },
        editButton:{
            width: '50%',
            maxWidth: '250px',
            textAlign: 'center',
        }
    };

    const handleProfile = () => {
        navigate('/profile');
    };

    const handleAccept = () => {
        updateAcceptance(chatroomId, true);
        navigate(`/chat`, { state: { profileData} });
    };

    const handleDecline = () => {
        deleteMessages(chatroomId);
        deleteChatroom(chatroomId);
        setTimeout(() => {
            navigate('/chatOverview');
        }, 300);
    };

    const handleBlock = () => {
        insertBlocked();
        navigate('/chatOverview');
    };
    const handleEdit = () => {
        setEditedMessage(message);
        setIsModalVisible(true);
    };

    const handleSave = () => {
        updateMessage(chatroomId, editedMessage);
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };


    return (
        <ConfigProvider theme={{token: antThemeTokens(themeColors)}}>
            <div
                style={{
                    padding: '20px',
                    position: 'relative',
                    minWidth: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    minHeight: '100dvh',
                    backgroundColor: themeColors.primary2,
                    color: themeColors.primary10,
                    width: '100%',
                    boxSizing: 'border-box',
                    zIndex: '0'
                }}
            >
                <HomeButtonUser color={themeColors.primary7}/>
                <ButterflyIcon color={themeColors.primary3}/>

                <div style={styles.header} onClick={() => handleProfileClick(otherUserId)}>
                    <Avatar src={profilePicture || 'default-avatar.png'}
                            style={styles.headerAvatar}>U</Avatar>
                    <Title level={2} style={{margin: 0, color: themeColors.primary10}} h2>{`${name}`}</Title>
                </div>
                <div style={styles.messageContainer}>
                    <p>{message}</p>
                </div>
                <div className="buttonContainer" >
                    {!isSender && (
                        <>
                            <Button className="ant-btn-accept" style={styles.button}
                                    onClick={handleAccept}>Accepteer</Button>
                            <Button className="ant-btn-decline" style={styles.button}
                                    onClick={handleDecline}>Weiger</Button>
                            <Button className="ant-btn-block" style={styles.button}
                                    onClick={handleBlock}>Blokkeer</Button>

                        </>
                    )}
                </div>
                <div>
                    {isSender && (
                        <>
                            <Button styles={styles.editButton} className="ant-btn-bewerk"
                                    onClick={handleEdit}>Bewerken</Button>
                        </>
                    )}
                </div>
                <Modal
                    title="Bewerk bericht"
                    visible={isModalVisible}
                    onOk={handleSave}
                    onCancel={handleCancel}
                    footer={[
                        <Button key="send" type="primary" onClick={handleSave}>
                            Opslaan
                        </Button>,
                    ]}
                >
                    <Input.TextArea
                        value={editedMessage}
                        onChange={(e) => setEditedMessage(e.target.value)}
                        rows={4}
                    />
                </Modal>
            </div>
            {selectedClient && (
                <ProfileDetailsModal
                    visible={isModalProfileVisible}
                    onClose={()=>handleModalProfileClose(setSelectedClient, setIsModalProfileVisible)}
                    clientData={selectedClient}
                />
            )}
        </ConfigProvider>
    );
};

export default ChatSuggestionPage;