import React, { useEffect, useState } from 'react';
import { Card, Tag, Avatar, Button, Divider, Select, Table, Popconfirm, message, ConfigProvider } from 'antd';
import { CloseOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import '../CSS/Ant design overide.css';
import themes from "../themes";

// Initial list of caretakers
const initialCaretakers = [
    { id: 1, name: 'John Doe', accessLevel: 'full', picture: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'Jane Smith', accessLevel: 'contact', picture: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, name: 'Sam Brown', accessLevel: 'chat', picture: 'https://i.pravatar.cc/150?img=3' },
];

const ProfileCard = () => {
    const [theme, setTheme] = useState('default');
    const [images, setImages] = useState([]);
    const [profilePicture, setProfilePicture] = useState('https://example.com/photo.jpg');
    const [caretakers, setCaretakers] = useState(initialCaretakers);

    // Apply theme styles
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

    // Function to handle access level change for caretakers
    const handleAccessLevelChange = (value, id) => {
        setCaretakers(prevCaretakers =>
            prevCaretakers.map(caretaker =>
                caretaker.id === id ? { ...caretaker, accessLevel: value } : caretaker
            )
        );
    };

    // Function to delete a caretaker
    const handleDelete = (id) => {
        if (caretakers.length <= 1) {
            message.warning("You must have at least one caretaker.");
            return;
        }
        setCaretakers(prevCaretakers => prevCaretakers.filter(caretaker => caretaker.id !== id));
    };

    // Table columns for caretakers
    const caretakerColumns = [
        {
            dataIndex: 'picture',
            key: 'picture',
            render: (text) => <Avatar src={text} />,
        },
        {
            dataIndex: 'name',
            key: 'name',
        },
        {
            dataIndex: 'accessLevel',
            key: 'accessLevel',
            render: (text, record) => (
                <Select
                    defaultValue={text}
                    onChange={(value) => handleAccessLevelChange(value, record.id)}
                    style={{ width: '100%' }}
                >
                    <Select.Option value="full">Volledige toegang</Select.Option>
                    <Select.Option value="chat">Gesprekken</Select.Option>
                    <Select.Option value="contact">Contacten</Select.Option>
                    <Select.Option value="profile">Publiek profiel</Select.Option>
                </Select>
            ),
        },
        {
            key: 'actions',
            render: (_, record) => (
                <Popconfirm
                    title="Are you sure to delete this caretaker?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Yes"
                    cancelText="No"
                    disabled={caretakers.length <= 1}
                >
                    <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        disabled={caretakers.length <= 1}
                    />
                </Popconfirm>
            ),
        },
    ];

    return (
        <div style={{padding: '20px', position: 'relative', width: '100%'}}>
            <Card
                style={{
                    width: '100%',
                    margin: '0 auto',
                    paddingTop: '20px',
                }}
                cover={
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        {images.length > 0 ? (
                            images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Uploaded ${index}`}
                                    style={{width: '100px', height: '100px', objectFit: 'cover', margin: '5px'}}
                                />
                            ))
                        ) : (
                            <Avatar
                                src={profilePicture}
                                alt="Martin's Profile Picture"
                                size={100}
                                style={{margin: '20px auto', display: 'block'}}
                            />
                        )}
                        <h2 style={{textAlign: 'center', margin: '0', fontSize: '24px'}}>Martin, 27</h2>
                        <Divider/>
                        <Button
                            type="text"
                            icon={<CloseOutlined/>}
                            style={{position: 'absolute', top: '10px', right: '10px'}}
                        />
                    </div>
                }
            >
            </Card>
                <p>
                    <strong>Kies een kleur: </strong>
                    <Select
                        style={{minWidth: '25%'}}
                        placeholder="Selecteer een kleur"
                        options={Object.keys(themes).map((themeKey) => ({
                            value: themeKey,
                            label: themeKey === "default"
                                ? "Standaard"
                                : themeKey.replace(/_/g, ' ').charAt(0).toUpperCase() + themeKey.replace(/_/g, ' ').slice(1)
                        }))}
                        value={theme}
                        onChange={(value) => setTheme(value)}
                    />
                </p>

                <Divider/>

                <p><strong>Begeleiding met toegang: </strong></p>

                {/* Caretakers Table */}
                <Table
                    dataSource={caretakers}
                    columns={caretakerColumns}
                    rowKey="id"
                    pagination={false}
                    showHeader={false}
                />

            <Divider/>

            <p><strong>Seksualiteit: </strong> <Select
                style={{minWidth: '25%'}}
                placeholder="Selecteer seksualiteit"
                options={[
                    {value: 'Hetero', label: 'Heteroseksueel'},
                    {value: 'Bi', label: 'Biseksueel'},
                    {value: 'Homo', label: 'Homoseksueel'},
                ]}
            /></p>

            <Divider/>

            <Button
                type="primary"
                icon={<SaveOutlined/>}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 1000
                }}
            >
                Veranderingen opslaan
            </Button>
        </div>
    );
};

export default ProfileCard;
