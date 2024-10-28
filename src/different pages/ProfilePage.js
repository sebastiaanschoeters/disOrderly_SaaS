// Import necessary libraries
import React, { useEffect, useState } from 'react';
import { Card, Tag, Avatar, Button, Divider } from 'antd';
import { MessageOutlined, CloseOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import '../CSS/Ant design overide.css';
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
        <div style={{ padding: '20px', position: 'relative', width: '100%' }}>
            {/* Card Container */}
            <Card
                style={{
                    width: '100%',
                    margin: '0 auto', // Center horizontally
                    paddingTop: '20px',
                }}
                cover={
                    <Avatar /* Needs to import picture from database */
                        src="https://example.com/photo.jpg"
                        alt="Martin's Profile Picture"
                        size={100}
                        style={{margin: '20px auto', display: 'block'}}
                    />
                }
            >
                {/* Exit button in the top right */}
                <Button
                    type="text"
                    icon={<CloseOutlined/>}
                    style={{position: 'absolute', top: '10px', right: '10px'}}
                />

                <h2 style={{textAlign: 'center', margin: '0', fontSize: '24px'}}>Martin, 27</h2>

                <Divider/>

                <p><strong>Locatie:</strong> <Tag>Leuven</Tag></p>

                <Divider/>

                <p><strong>Interesses:</strong></p>
                <div>
                    <Tag>Voetbal</Tag>
                    <Tag>Wandelen</Tag>
                    <Tag>Gezelschapsspellen spelen</Tag>
                    <Tag>Iets gaan drinken met vrienden</Tag>
                </div>

                <Divider/>

                <p><strong>Is op zoek naar:</strong></p>
                <div>
                    <Tag>Vrienden</Tag>
                    <Tag>Relatie</Tag>
                </div>

                <Divider/>

                <p><strong>Woonsituatie:</strong> <Tag>Woont alleen</Tag></p>

                <Divider/>

                <p><strong>Kan zich zelfstanding verplaatsen:</strong> <Tag>Ja</Tag></p>
            </Card>

            {/* Chat button in the bottom right */}
            <Button
                type="primary"
                icon={<MessageOutlined/>}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 1000 // Ensures it stays on top
                }}
            >
                Chat met Martin
            </Button>
        </div>
    );
};

export default ProfileCard;
