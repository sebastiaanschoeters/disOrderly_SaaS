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
    const theme = 'blauw';
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
        },
        buttonContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
        },
        button:{
            margin: '0 5px',
            flex: 1,
        }
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
                    <Avatar style={styles.headerAvatar} size="large" src="https://example.com/images/user.jpg">U</Avatar>
                    <Title level={4} style={{ margin: 0, color: '#fff' }}>{name}</Title>
                    <Button type='primary' shape='circle' style={styles.closeButton} icon={<CloseOutlined/>} onClick={() => navigate('/chatOverview')}/>
                </div>
                <div style={styles.messageContainer}>
                    <p>Hey! I'd love to chat with you. Are you available?</p>
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