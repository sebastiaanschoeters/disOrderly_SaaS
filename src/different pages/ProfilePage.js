import React, { useState, useEffect } from 'react';
import {Tag, Avatar, Button, Divider, ConfigProvider, Spin} from 'antd';
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
import '../CSS/AntDesignOverride.css';
import { antThemeTokens, themes } from '../themes';
import {useNavigate} from "react-router-dom";

const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q")

const useFetchProfileData = (actCode) => {
    const [profileData, setProfileData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: profileData, error: profileError } = await supabase
                    .from('Profile')
                    .select('*')
                    .eq('ActCode', actCode);

                if (profileError) throw profileError;
                if (profileData.length > 0) {
                    const profile = profileData[0];

                    let parsedTheme = 'blauw';
                    let isDarkMode = false;

                    if (profile.theme) {
                        try {
                            const [themeName, darkModeFlag] = JSON.parse(profile.theme);
                            parsedTheme = themeName;
                            isDarkMode = darkModeFlag;
                        } catch (error) {
                            console.error('Error parsing theme', error);
                        }
                    }

                    const { data: profileInterests, error: interestsError } = await supabase
                        .from('ProfileInterests')
                        .select('interestId')
                        .eq('ProfileId', profile.ActCode);

                    if (interestsError) throw interestsError;

                    if (profileInterests && profileInterests.length > 0) {
                        const interestIds = profileInterests.map(item => item.interestId);
                        const { data: interestsData, error: fetchInterestsError } = await supabase
                            .from('Interests')
                            .select('interest')
                            .in('interestId', interestIds);

                        if (fetchInterestsError) throw fetchInterestsError;
                        profile.interests = interestsData.map(interest => ({ interest_name: interest.interest }));
                    }

                    setProfileData({ ...profile, theme: isDarkMode ? `${parsedTheme}_donker` : parsedTheme });
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [actCode]);

    return { profileData, isLoading, error };
};

const ProfileDetail = ({ label, value, icon }) => (
    <p style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '5px' }}>
        <strong style={{ width: '20%', minWidth: '150px' }}>{icon} {label}: </strong>
        {value || 'Niet beschikbaar'}
    </p>
);

const ProfileCard = () => {
    const [theme, setTheme] = useState('blauw');
    const [images, setImages] = useState([]); /* get images from database */
    const { profileData, isLoading, error } = useFetchProfileData('1547'); // Replace with dynamic ActCode as needed
    const themeColors = themes[theme] || themes.blauw;

    useEffect(() => {
        if (profileData.theme){
            setTheme(profileData.theme);
        }
    }, [profileData.theme]);

    const calculateAge = (birthdate) => {
        if (!birthdate) return 'Onbekend';
        const birthDate = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    let lookingForArray = profileData.lookingFor;

    if (typeof profileData.lookingFor === 'string') {
        try {
            lookingForArray = JSON.parse(profileData.lookingFor);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            lookingForArray = [];
        }
    }

    if (isLoading) return <Spin tip="Profiel laden..." />;
    if (error) return <p>Failed to load profile: {error}</p>;

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div
                style={{
                    padding: '20px',
                    position: 'relative',
                    minWidth: '100%',
                    minHeight: '100vh',
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
                                {profileData.name || 'Naam'}, {calculateAge(profileData.birthDate) || 'Leeftijd'}
                            </h2>
                            <p style={{margin: '5px 0', maxWidth: '550px'}}>
                            {profileData.bio || ''}
                        </p>
                        </div>
                    </div>
                </div>

                <Divider />

                <ProfileDetail label="Locatie" value={profileData.location} icon={<EnvironmentOutlined />} />
                <Divider />
                <ProfileDetail label="Geslacht" value={profileData.gender} icon={<UserOutlined />} />
                <Divider />
                <ProfileDetail
                    label="Interesses"
                    value={
                        profileData.interests && profileData.interests.length > 0
                            ? profileData.interests.map((interest, index) => (
                                <Tag key={index}>{interest.interest_name}</Tag>
                            ))
                            : 'Geen interesses beschikbaar'
                    }
                    icon={<StarOutlined />}
                />
                <Divider />
                <ProfileDetail
                    label="Is op zoek naar"
                    value={
                        Array.isArray(lookingForArray)
                            ? lookingForArray.map((option, index) => <Tag key={index}>{option}</Tag>)
                            : 'Vrienden'
                    }
                    icon={<HeartOutlined />}
                />
                <Divider />
                <ProfileDetail
                    label="Woonsituatie"
                    value={profileData.livingSituation}
                    icon={<HomeOutlined />}
                />
                <Divider />
                <ProfileDetail
                    label="Kan zich zelfstandig verplaatsen"
                    value={profileData.mobility ? 'Ja' : 'Nee'}
                    icon={<CarOutlined />}
                />

                {/* Chat button in the bottom right */}
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
