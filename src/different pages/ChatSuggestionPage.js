import React from 'react';
import { Avatar, Button, Typography, ConfigProvider } from 'antd';
import {useNavigate, useParams} from 'react-router-dom';
import { themes, antThemeTokens } from '../themes';

const { Title } = Typography;

const ChatSuggestionPage = () => {
    const navigate = useNavigate();
    const theme = 'blauw';
    const themeColors = themes[theme] || themes.blauw;
    const { name } = useParams();

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
        },
        header: {
            backgroundColor: themeColors.primary6,
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '8px',
            marginBottom: '15px',
        },
        headerAvatar: {
            marginRight: '10px',
        },
        messageContainer: {
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: themeColors.primary4,
            color: themeColors.primary10,
            marginBottom: '20px',
        },
        buttonContainer: {
            display: 'flex',
            justifyContent: 'space-between',
        },
        button: {
            margin: '0 5px',
        },
    };

    const handleAccept = () => {
        navigate('/chat/${name}');
    };

    const handleDecline = () => {
        console.log('Message declined');
        navigate('/chatOverview');
    };

    const handleBlock = () => {
        console.log('User blocked');
        navigate('/chatOverview');
    };

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <Avatar style={styles.headerAvatar} size="large" src="https://example.com/images/user.jpg" />
                    <Title level={4} style={{ margin: 0, color: '#fff' }}>{name}</Title>
                    <Button type="link" style={{ marginLeft: 'auto', color: '#fff' }} onClick={() => navigate('/chatOverview')}>
                        Close
                    </Button>
                </div>
                <div style={styles.messageContainer}>
                    <p>Hey! I'd love to chat with you. Are you available?</p>
                </div>
                <div style={styles.buttonContainer}>
                    <Button type="primary" style={styles.button} onClick={handleAccept}>Accepteer</Button>
                    <Button style={styles.button} onClick={handleDecline}>Weiger</Button>
                    <Button type="danger" style={styles.button} onClick={handleBlock}>Blokkeer</Button>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default ChatSuggestionPage;