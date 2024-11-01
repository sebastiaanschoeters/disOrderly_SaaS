import React, { useEffect, useState } from 'react';
import { Card, Tag, Avatar, Button, Divider, Select, Checkbox, Input, Upload, ConfigProvider } from 'antd';
import { CloseOutlined, SaveOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import '../CSS/Ant design overide.css'
import { antThemeTokens, themes } from '../themes';

const ProfileCard = () => {
    const [theme, setTheme] = useState('default');
    const themeColors = themes[theme] || themes.default; // Get theme colors
    const [images, setImages] = useState([]);
    const [profilePicture, setProfilePicture] = useState('https://example.com/photo.jpg'); // Initial profile picture URL
    const [location, setLocation] = useState(null);
    const [locationOptions, setLocationOptions] = useState([
        { value: 'Leuven', label: 'Leuven' },
        { value: 'Brussel', label: 'Brussel' },
        { value: 'Gent', label: 'Gent' },
        { value: 'Antwerpen', label: 'Antwerpen' },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [interests, setInterests] = useState(['Voetbal', 'Wandelen', 'Gezelschapsspellen spelen', 'Iets gaan drinken met vrienden']);
    const [selectedInterests, setSelectedInterests] = useState([]); // Tracks selected interests
    const [newInterest, setNewInterest] = useState(''); // Tracks the new interest input

    const handleLocationInputKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue) {
            const newOption = { value: inputValue, label: inputValue };
            setLocationOptions([...locationOptions, newOption]);
            setLocation(inputValue);
            setInputValue('');
        }
    };

    const handleAddInterest = () => {
        if (newInterest && !interests.includes(newInterest)) {
            setInterests([...interests, newInterest]);
            setNewInterest('');
        }
    };

    const handleInterestSelectChange = (value) => {
        setSelectedInterests(value);
    };

    const handleRemoveInterest = (interest) => {
        setSelectedInterests(selectedInterests.filter(i => i !== interest));
    };

    const handleProfilePictureChange = ({ file }) => {
        if (file.status === 'done') {
            const imageUrl = URL.createObjectURL(file.originFileObj); // Create a temporary URL for the image
            setProfilePicture(imageUrl);
        }
    };

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div style={{
                padding: '20px',
                position: 'relative',
                width: '100%',
                height: '100vh',
                backgroundColor: themeColors.primary2
            }}>
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
                    {/* Profile Picture Upload */}
                    <div style={{ marginTop: '10px', marginBottom: '20px' }}> {/* Add marginBottom here */}
                        <Upload showUploadList={false} onChange={handleProfilePictureChange}>
                            <Button icon={<UploadOutlined />}>Kies nieuwe profiel foto</Button>
                        </Upload>
                    </div>
                </div>

                <Button
                    type="text"
                    icon={<CloseOutlined/>}
                    style={{position: 'absolute', top: '10px', right: '10px'}}
                />

                <h2 style={{textAlign: 'center', margin: '0', fontSize: '24px'}}>Martin, 27</h2>

                <Divider/>

                <p style={{display: 'flex', alignItems: 'center', width: '100%', gap: '2%'}}>
                    <strong style={{width: '20%', minWidth: '150px'}}>Locatie: </strong>
                    <Select
                        showSearch
                        allowClear
                        placeholder="Selecteer locatie of voeg toe"
                        style={{flex: 1, minWidth: '200px'}}
                        value={location}
                        onChange={(value) => setLocation(value)}
                        options={locationOptions}
                        onSearch={(value) => setInputValue(value)}
                        onInputKeyDown={handleLocationInputKeyDown}
                    />
                </p>

                <Divider/>

                <p style={{display: 'flex', alignItems: 'center', width: '100%', gap:'2%'}}>
                    <strong style={{width: '20%', minWidth: '150px'}}>Geslacht: </strong>
                    <Select
                        style={{flex: 1, minWidth: '200px'}}
                        placeholder="Selecteer geslacht"
                        options={[
                            {value: 'Man', label: 'Man'},
                            {value: 'Women', label: 'Vrouw'},
                            {value: 'Non-binary', label: 'Non-binair'},
                        ]}
                    />
                </p>

                <Divider/>

                <p style={{display: 'flex', alignItems: 'center', width: '100%', gap: '2%'}}>
                    <strong style={{width: '20%', minWidth: '150px'}}>Interesses:</strong>
                    <Select
                        mode="multiple"
                        allowClear
                        placeholder="Selecteer interesses of voeg toe"
                        style={{flex: 1, minWidth: '200px', marginBottom: '10px'}}
                        value={selectedInterests}
                        onChange={handleInterestSelectChange}
                        options={interests.map(interest => ({value: interest, label: interest}))}
                        onSearch={(value) => setNewInterest(value)}
                        onInputKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleAddInterest();
                            }
                        }}
                    />
                </p>

                <Divider/>

                <p style={{display: 'flex', alignItems: 'center', width: '100%', gap: '2%'}}>
                    <strong style={{width: '20%', minWidth: '150px'}}>Is op zoek naar:</strong>
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        minWidth: '200px'
                    }}> {/* Changed flexDirection to column */}
                        <Checkbox style={{width: 'auto'}}>Vrienden</Checkbox>
                        <Checkbox style={{width: 'auto'}}>Relatie</Checkbox>
                        <Checkbox style={{width: 'auto'}}>Intieme ontmoeting</Checkbox>
                    </div>
                </p>


                <Divider/>

                <p style={{display: 'flex', alignItems: 'center', width: '100%', gap: '2%'}}>
                    <strong style={{width: '20%', minWidth: '150px'}}>Woonsituatie:</strong>
                    <Select
                        placeholder="Selecteer jouw woonsituatie"
                        style={{flex: 1, minWidth: '200px'}}
                        options={[
                            {value: 'Alone', label: 'Woont alleen'},
                            {value: 'Guided', label: 'Begeleid wonen'},
                            {value: 'Parents', label: 'Bij ouders'},
                            {value: 'group', label: 'In groepsverband'},
                            {value: 'instance', label: 'zorginstelling'},
                        ]}
                    />
                </p>

                <Divider/>

                <p style={{display: 'flex', alignItems: 'center', width: '100%', gap:'2%'}}>
                    <strong style={{width: '20%', minWidth: '150px'}}>Kan zich zelfstanding verplaatsen:</strong>
                    <Select
                        style={{flex: 1, minWidth: '200px'}}
                        defaultValue="False"
                        options={[
                            {value: 'True', label: 'ja'},
                            {value: 'False', label: 'nee'},
                        ]}
                    />
                </p>

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
        </ ConfigProvider>
    );
};

export default ProfileCard;
