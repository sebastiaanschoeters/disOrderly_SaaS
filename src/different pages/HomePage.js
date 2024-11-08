import 'antd/dist/reset.css'; // Import Ant Design styles
import '../CSS/Ant design overide.css'
import { antThemeTokens, themes } from '../themes';
import { Button, ConfigProvider} from 'antd';
import {MessageOutlined, UserOutlined, SearchOutlined, SettingOutlined } from "@ant-design/icons";
import React, {useState} from "react";
import { useNavigate } from 'react-router-dom';


const HomePage = () => {
    const [theme, setTheme] = useState('blauw');
    const themeColors = themes[theme] || themes.blauw;
    const navigate = useNavigate();


    return (<ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>

        <div
            style={{
                padding: '20px',
                position: 'relative',
                width: '100%',
                height: '100vh',
                backgroundColor: themeColors.primary2,
                color : themeColors.primary10,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            <div style={{ display: 'flex', gap: '144px', flexWrap: 'wrap', justifyContent: 'center'}}>

            <Button
                type="primary"
                icon={<SearchOutlined style={{ fontSize: '4rem' }} />}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '240px',
                    height: '240px',
                }}
            >
                <h2 style={{ margin: '0', fontSize: '24px' }}>Zoeken</h2>
            </Button>

            <Button
                type="primary"
                icon={<MessageOutlined style={{ fontSize: '4rem' }} />}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '240px',
                    height: '240px',
                }}
                onClick={() => navigate('/chatoverview')}
            >
                <h2 style={{ margin: '0', fontSize: '24px' }}>Chats</h2>
            </Button>

            <Button
                type="primary"
                icon={<UserOutlined style={{ fontSize: '4rem' }} />}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '240px',
                    height: '240px',
                }}
                onClick={() => navigate('/profileEdit')}

            >
                <h2 style={{ margin: '0', fontSize: '24px' }}>Profiel</h2>
            </Button>

            </div>

            <Button
                type="primary"
                icon={<SettingOutlined style={{ fontSize: '1.5rem' }} />}
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '80px',
                    height: '80px',
                }}
                onClick={() => navigate('/profilePersonal')}

            >
                <h2 style={{ margin: '0', fontSize: '1rem' }}>Settings</h2>
            </Button>

        </div>
        </ConfigProvider>
    );
};

export default HomePage;