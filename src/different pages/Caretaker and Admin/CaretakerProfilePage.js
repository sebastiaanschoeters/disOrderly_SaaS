import React, { useState, useEffect } from 'react';
import {Avatar, Divider, ConfigProvider} from 'antd';
import {
    PhoneOutlined,
    MailOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { createClient } from "@supabase/supabase-js";
import 'antd/dist/reset.css';
import '../../CSS/AntDesignOverride.css';
import { ButterflyIcon, antThemeTokens, themes } from '../../Extra components/themes';
import { useLocation } from 'react-router-dom';
import useFetchCaretakerData from "../../UseHooks/useFetchCaretakerData";

const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q")


const ProfileDetail = ({ label, value, icon }) => (
    <p style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '5px'}}>
        <strong style={{ width: '20%', minWidth: '150px', flexShrink: 0 }}>{icon} {label}: </strong>
        <span style={{ flexWrap: 'wrap' }}>{value || 'Niet beschikbaar'}</span>
    </p>
);

const ProfileCard = ({ actCode }) => {
    console.log(actCode)
    const { profileData, isLoading, error } = useFetchCaretakerData(actCode)
    // Derive theme colors
    const theme = profileData.theme || 'blauw';
    const themeColors = themes[theme] || themes.blauw;

    const applyThemeToCSS = (themeColors) => {
        const root = document.documentElement;
        Object.entries(themeColors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
    };

    useEffect(() => {
        applyThemeToCSS(themeColors); // Apply the selected theme
    }, [themeColors]);

    // Profile picture
    const profilePicture = profileData.profile_picture
        ? `${profileData.profile_picture}?t=${new Date().getTime()}`
        : "https://example.com/photo.jpg";

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div
                style={{
                    padding: '20px',
                    position: 'relative',
                    minWidth: '100%',
                    backgroundColor: themeColors.primary2,
                    color: themeColors.primary10,
                    zIndex: '0'
                }}
            >
                {/* Header section with profile picture, name, age, and biography */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <Avatar
                            src={profilePicture}
                            alt={profileData.name || "No Name"}
                            style ={{
                                minWidth: '200px',
                                minHeight: '200px',
                                borderRadius: '50%'
                            }}
                        />
                        <h2 style={{ margin: '0' }}>
                            {profileData.name || 'Naam'}
                        </h2>
                    </div>
                </div>

                <Divider />

                <ProfileDetail label="Telefoon nummer" value = {`${profileData.phone_number}`} icon={<PhoneOutlined />} />

                <Divider />

                <ProfileDetail label="E-mail" value={profileData.email} icon={<MailOutlined />} />

                <Divider />

                <ProfileDetail label="Organizatie" value={profileData.organization} icon={<TeamOutlined />} />

            </div>
        </ConfigProvider>
    );
};

export default ProfileCard;
