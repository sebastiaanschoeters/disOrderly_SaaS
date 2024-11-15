import 'antd/dist/reset.css'; // Import Ant Design styles
import '../CSS/AntDesignOverride.css'
import { antThemeTokens, themes } from '../themes';
import {Button, Card, ConfigProvider, List} from 'antd';
import {PlusOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q");


const AdminPage = () => {
    const [theme, setTheme] = useState('blauw');
    const themeColors = themes[theme] || themes.blauw;
    const navigate = useNavigate();
    const [Organizations, setOrganizations] = useState([]);

    useEffect(() => {fetchData()}
    , [])

    const fetchData = async () => {
        const {data, error} = await supabase.from("Organizations").select("name")
        setOrganizations(data)
        console.log(data)
    }

    const styles = {
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
    }


    return (<ConfigProvider theme={{token: antThemeTokens(themeColors)}}>
            <div
                style={{
                    padding: '20px',
                    position: 'relative',
                    width: '100%',
                    height: '100vh',
                    backgroundColor: themeColors.primary2,
                    color: themeColors.primary10,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <div style={{display: 'flex', gap: '144px', flexWrap: 'wrap', justifyContent: 'center'}}>

                    <List
                        itemLayout="horizontal"
                        style={styles.list}
                        dataSource={Organizations}
                        renderItem={(Organizations) => (
                            <Card
                                style={styles.card}
                                hoverable={true}
                                >
                                <Card.Meta
                                    title={<span style={styles.name}><li>{Organizations.name}</li></span>}
                                />

                            </Card>
                    )}
                    >
                    </List>

                    <Button
                        type="primary"
                        icon={<PlusOutlined style={{fontSize: '4rem'}}/>}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '300px',
                            height: '150px',
                        }}
                    >
                        <h2 style={{margin: '0', fontSize: '24px'}}>Add new organization</h2>
                    </Button>


                </div>


                <Button
                    type="primary"
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100px',
                        height: '40px',
                    }}
                    onClick={() => navigate('/login')}

                >
                    <h2 style={{margin: '0', fontSize: '1rem'}}>Afmelden</h2>
                </Button>

            </div>
        </ConfigProvider>
    );
};

export default AdminPage;