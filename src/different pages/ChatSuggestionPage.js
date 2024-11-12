import React from 'react';
import { Avatar, Button, Typography, ConfigProvider } from 'antd';
import {useNavigate, useParams} from 'react-router-dom';
import { CloseOutlined } from '@ant-design/icons';
import { themes, antThemeTokens } from '../themes';
import '../CSS/ChatSuggestionPage.css';

const { Title } = Typography;

const ChatSuggestionPage = () => {
    const navigate = useNavigate();
    const { name } = useParams();
    const theme = 'blue';
    const themeColors = themes[theme] || themes.blauw;

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
        navigate(`/chat/${name}`);
    };

    const handleDecline = () => {
        navigate('/chatOverview');
    };

    const handleBlock = () => {
        navigate('/chatOverview');
    };

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <Avatar style={styles.headerAvatar} src="https://example.com/images/user.jpg" onClick={handleProfile}>U</Avatar>
                    <Title level={2} style={{ margin: 0, color: themeColors.primary10 }}h2>{name}</Title>
                    <Button type='primary' shape='circle' style={styles.closeButton} icon={<CloseOutlined/>} onClick={() => navigate('/chatOverview')}/>
                </div>
                <div style={styles.messageContainer}>
                    <p>Hey, ik zag je profiel en ik hou oo van honden. Heb je zelf een hond?</p>
                </div>
                <div style={styles.buttonContainer}>
                    <Button className='ant-btn-accept' style={styles.button} onClick={handleAccept}>Accepteer</Button>
                    <Button className='ant-btn-decline' style={styles.button} onClick={handleDecline}>Weiger</Button>
                    <Button className='ant-btn-block' style={styles.button} onClick={handleBlock}>Blokkeer</Button>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default ChatSuggestionPage;