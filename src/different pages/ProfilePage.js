// Import necessary libraries
import React, {useEffect, useState} from 'react';
import { Card, Tag, Avatar, Button, Divider } from 'antd';
import { MessageOutlined, CloseOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import '../CSS/Ant design overide.css'
import themes from "../themes";

// The ProfileCard component
const ProfileCard = () => {
    const [theme, setTheme] = useState('default');
    // Apply the selected theme colors
    useEffect(() => {
        const selectedTheme = themes[theme];
        document.documentElement.style.setProperty('--color1', selectedTheme.color1);
        document.documentElement.style.setProperty('--color2', selectedTheme.color2);
        document.documentElement.style.setProperty('--color3', selectedTheme.color3);
        document.documentElement.style.setProperty('--color4', selectedTheme.color4);
        document.documentElement.style.setProperty('--color5', selectedTheme.color5);
        document.documentElement.style.setProperty('--textColorD', selectedTheme.textColorD);
        document.documentElement.style.setProperty('--textColorL', selectedTheme.textColorL);
    }, [theme]);
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
            <Card
                style={{ width: '100%', borderRadius: 10 }}
                cover={
                    <Avatar /* Needs to import picture from database */
                        src="https://example.com/photo.jpg"
                        alt="Martin's Profile Picture"
                        size={100}
                        style={{ margin: '20px auto', display: 'round' }}
                    />
                }
                actions={[
                    <Button type="primary" icon={<MessageOutlined />}>Chat met Martin</Button>,
                    <Button type="text" icon={<CloseOutlined />}/>
                ]}
            >
                <h2 style={{ textAlign: 'center', margin: '0', fontSize: '24px' }}>Martin, 27</h2>

                <Divider />

                <p><strong>Locatie:</strong></p>
                <Tag>Leuven</Tag>

                <Divider />

                <p><strong>Interesses:</strong></p>
                <div>
                    <Tag>Voetbal</Tag>
                    <Tag>Wandelen</Tag>
                    <Tag>Gezelschapsspellen spelen</Tag>
                    <Tag>Iets gaan drinken met vrienden</Tag>
                </div>

                <Divider />

                <p><strong>Is op zoek naar:</strong></p>
                <div>
                    <Tag>Vrienden</Tag>
                    <Tag>Relatie</Tag>
                </div>
            </Card>
        </div>
    );
};

export default ProfileCard;
