import 'antd/dist/reset.css'; // Import Ant Design styles
import '../CSS/Ant design overide.css'
import { antThemeTokens, themes } from '../themes';
import {Avatar, Button, Card, ConfigProvider, Input, List, Typography} from 'antd';
import {CloseOutlined} from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Title from "antd/es/skeleton/Title";
import { createClient } from "@supabase/supabase-js";


const Search = () => {const navigate = useNavigate();
    const [theme, setTheme] = useState('blauw');
    const themeColors = themes[theme] || themes.blauw;
    const [searchQuery, setSearchQuery] = useState('');
    const { Title } = Typography;
    const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q")

    const [users, setUsers] = useState([]);
    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase
                .from('Profile')  // Table name
                .select('ActCode, name');  // Select the fields you need

            if (error) {
                console.error('Error fetching users:', error);
            } else {
                setUsers(data);
            }
        };

        fetchUsers();
    }, []);

    const filteredChats = users.filter((chat) =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearch = (value) => {
        setSearchQuery(value);
    };

    const styles = {
        chatContainer: {
            padding: '20px',
            width: '100%',
            height: '100vh',
            backgroundColor: themeColors.primary2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflowY: 'auto',
        },
        titleButton: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '0px 20px'
        },
        title: {
            flexGrow: 1,
            textAlign: 'center',
            margin: 0,
        },
        button: {
            backgroundColor: themeColors.primary8,
        },
        searchBar: {
            width: '75%',
            marginBottom: '20px',
            marginTop: '20px',
        },
        list: {
            width: '75%',
        },
        card: {
            width: '100%',
            height: '75px',
            marginBottom: '10px',
            borderRadius: '10px',
            borderWidth: '1px',
            borderColor: themeColors.primary7,
            cursor: 'pointer',
        },
        name: {
            fontSize: '14px',
        }
    };

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div style={styles.chatContainer}>
                <div style={styles.titleButton}>
                    <Title level={2} style={styles.title}>Gebruikers</Title>

                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        style={{ position: 'absolute', top: '10px', right: '10px' }}
                        onClick={() => navigate('/home')}
                    />

                </div>

                <Input.Search
                    placeholder="Zoek gebruikers..."
                    style={styles.searchBar}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onSearch={handleSearch}
                    enterButton={false}
                    allowClear
                />
                <List
                    itemLayout="horizontal"
                    style={styles.list}
                    dataSource={filteredChats}
                    renderItem={(chat) => (
                        <Card
                            style={styles.card}
                            hoverable={true}
                            onClick={() => {
                                    navigate(`/profile`);
                            }}
                        >
                            <Card.Meta
                                avatar={<Avatar>U</Avatar>}
                                title={<span style={styles.name}>{chat.name}</span>}
                            />
                        </Card>
                    )}
                />
            </div>
        </ConfigProvider>
    );
};

export default Search;