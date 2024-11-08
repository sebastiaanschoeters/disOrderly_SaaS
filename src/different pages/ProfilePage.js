import React, { useState, useEffect } from 'react';
import { Card, Tag, Avatar, Button, Divider, ConfigProvider } from 'antd';
import {
    MessageOutlined,
    CloseOutlined,
    EnvironmentOutlined,
    UserOutlined,
    HeartOutlined,
    StarOutlined,
    HomeOutlined,
    CarOutlined
} from '@ant-design/icons';
import { createClient } from "@supabase/supabase-js";
import 'antd/dist/reset.css';
import '../CSS/Ant design overide.css';
import { antThemeTokens, themes } from '../themes';
import {useNavigate} from "react-router-dom";

const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q")

const ProfileCard = () => {
    const [theme, setTheme] = useState('blauw');
    const themeColors = themes[theme] || themes.blauw;
    const [profileData, setProfileData] = useState({});
    const [images, setImages] = useState([]); /* get images from database */
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfileData();
    }, []);

    // Fetch user profile data from Supabase
    const fetchProfileData = async () => {
        const { data, error } = await supabase
            .from('Profile')
            .select('*')
            .eq('ActCode', '5')


        if (data) {
            console.log('Fetched profile data:', data);
            setProfileData(data[0]);
        } else {
            console.error('Error fetching data:', error);
        }
    };

    const calculateAge = (birthdate) => {
        const birthDate = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        // Adjust age if the birthday has not occurred yet this year
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };


    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div
                style={{
                    padding: '20px',
                    position: 'relative',
                    width: '100%',
                    height: '100vh',
                    backgroundColor: themeColors.primary2,
                    color: themeColors.primary10
                }}
            >
                {/* Header section with profile picture, name, age, and biography */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        {images.length > 0 ? (
                            images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Uploaded ${index}`}
                                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }}
                                />
                            ))
                        ) : (
                            <Avatar
                                src={profileData.picture || "https://example.com/photo.jpg"} // Fallback to default avatar
                                alt={profileData.name || "No Name"}
                                size={100}
                            />
                        )}
                        <div>
                            <h2 style={{ margin: '0' }}>
                                {profileData.name || 'Martin'}, {calculateAge(profileData.birthDate)}
                            </h2>
                            <p style={{margin: '5px 0', maxWidth: '550px'}}>
                            {profileData.bio || 'Hey, ik eet graag pasta :)'}
                        </p>
                        </div>
                    </div>
                </div>

                {/* Exit button in the top right */}
                <Button
                    type="text"
                    icon={<CloseOutlined />}
                    style={{ position: 'absolute', top: '10px', right: '10px' }}
                    onClick={() => navigate('/search')}

                />

                <Divider />

                {/* Static fields */}
                <p style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '2%' }}>
                    <strong style={{ width: '20%', minWidth: '150px' }}><EnvironmentOutlined /> Locatie: </strong>
                    {profileData.location || 'Leuven'}
                </p>

                <Divider />

                <p style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '2%' }}>
                    <strong style={{ width: '20%', minWidth: '150px' }}><UserOutlined /> Geslacht: </strong>
                    {profileData.gender || 'Man'}
                </p>

                <Divider />

                <p style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '2%' }}>
                    <strong style={{ width: '20%', minWidth: '150px' }}><StarOutlined /> Interesses: </strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                        {profileData.interests ? profileData.interests.map((interest, index) => (
                            <Tag key={index}>{interest}</Tag>
                        )) : <Tag>Voetbal</Tag>}
                    </div>
                </p>

                <Divider />

                <p style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '2%' }}>
                    <strong style={{ width: '20%', minWidth: '150px' }}><HeartOutlined /> Is op zoek naar: </strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                        {profileData.lookingFor ? profileData.lookingFor.map((option, index) => (
                            <Tag key={index}>{option}</Tag>
                        )) : <Tag>Vrienden</Tag>}
                    </div>
                </p>

                <Divider />

                <p style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '2%' }}>
                    <strong style={{ width: '20%', minWidth: '150px' }}><HomeOutlined /> Woonsituatie: </strong>
                    {profileData.livingSituation || 'Woont alleen'}
                </p>

                <Divider />

                <p style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '2%' }}>
                    <strong style={{ width: '20%', minWidth: '150px' }}><CarOutlined /> Kan zich zelfstandig verplaatsen: </strong>
                    {profileData.mobility || 'Ja'}
                </p>

                {/* Chat button */}
                <Button
                    type="primary"
                    icon={<MessageOutlined />}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 1000
                    }}
                >
                    Chat met Martin
                </Button>
            </div>
        </ConfigProvider>
    );
};

export default ProfileCard;
