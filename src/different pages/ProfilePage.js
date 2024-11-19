import React, { useState, useEffect } from 'react';
import {Tag, Avatar, Button, Divider, ConfigProvider, Spin, Carousel} from 'antd';
import {
    MessageOutlined,
    EnvironmentOutlined,
    UserOutlined,
    HeartOutlined,
    StarOutlined,
    HomeOutlined,
    CarOutlined, LeftOutlined, RightOutlined, PictureOutlined
} from '@ant-design/icons';
import { createClient } from "@supabase/supabase-js";
import 'antd/dist/reset.css';
import '../CSS/AntDesignOverride.css';
import { ButterflyIcon, antThemeTokens, themes } from '../themes';

const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q")

const useFetchProfileData = (actCode) => {
    const [profileData, setProfileData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user data
                const { data: userData, error: userError } = await supabase
                    .from('User')
                    .select('*')
                    .eq('id', actCode);

                if (userError) throw userError;
                if (userData.length > 0) {
                    const user = userData[0];

                    // Fetch user information
                    const { data: userInfoData, error: userInfoError } = await supabase
                        .from('User information')
                        .select('*')
                        .eq('user_id', user.id);

                    if (userInfoError) throw userInfoError;

                    let parsedTheme = 'blauw';
                    let isDarkMode = false;

                    if (userInfoData && userInfoData.length > 0) {
                        const userInfo = userInfoData[0];
                        user.bio = userInfo.bio;
                        user.location = userInfo.location;
                        user.looking_for = userInfo.looking_for;
                        user.living_situation = userInfo.living_situation;
                        user.mobility = userInfo.mobility;
                        user.theme = userInfo.theme;
                        user.sexuality = userInfo.sexuality;
                        user.gender = userInfo.gender;

                        if (userInfo.theme) {
                            try {
                                const [themeName, darkModeFlag] = JSON.parse(userInfo.theme);
                                parsedTheme = themeName;
                                isDarkMode = darkModeFlag;
                            } catch (error) {
                                console.error('Error parsing theme', error);
                            }
                        }

                        // Fetch location details using location ID
                        if (userInfo.location) {
                            const { data: locationData, error: locationError } = await supabase
                                .from('Location')
                                .select('Gemeente, Longitude, Latitude')
                                .eq('id', userInfo.location);

                            if (locationError) throw locationError;

                            // If locationData is fetched, add it to user
                            if (locationData && locationData.length > 0) {
                                const location = locationData[0];
                                user.locationData = {
                                    gemeente: location.Gemeente,
                                    latitude: location.Latitude,
                                    longitude: location.Longitude,
                                };
                            }
                        }
                    }

                    // Fetch interests related to the user
                    const { data: interestedInData, error: interestedInError } = await supabase
                        .from('Interested in')
                        .select('interest_id')
                        .eq('user_id', user.id);

                    if (interestedInError) throw interestedInError;

                    if (interestedInData && interestedInData.length > 0) {
                        const interestIds = interestedInData.map(item => item.interest_id);
                        const { data: interestsData, error: fetchInterestsError } = await supabase
                            .from('Interests')
                            .select('Interest')
                            .in('id', interestIds);

                        if (fetchInterestsError) throw fetchInterestsError;
                        user.interests = interestsData.map(interest => ({ interest_name: interest.Interest }));
                    }

                    // Set the user profile data with the theme
                    setProfileData({
                        ...user,
                        theme: isDarkMode ? `${parsedTheme}_donker` : parsedTheme
                    });
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

const useFetchPicturesData = (actCode) => {
    const [pictures, setPictures] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user data
                const { data: pictures, error: userError } = await supabase
                    .from('Pictures')
                    .select('*')
                    .eq('User_id', actCode);

                if (userError) throw userError;
                if (pictures.length > 0) {
                    const user = pictures[0];
                }
                setPictures(pictures)
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [actCode]);

    return { pictures };
};

const ProfileDetail = ({ label, value, icon }) => (
    <p style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '5px'}}>
        <strong style={{ width: '20%', minWidth: '150px', flexShrink: 0 }}>{icon} {label}: </strong>
        <span style={{ flexWrap: 'wrap' }}>{value || 'Niet beschikbaar'}</span>
    </p>
);

const ProfileCard = () => {
    const [theme, setTheme] = useState('blauw');
    const [profilePicture, setProfilePicture] = useState(''); /* get images from database */
    const [images, setImages] = useState([]);
    const { profileData, isLoading, error } = useFetchProfileData('1519'); // Replace with dynamic ActCode as needed
    const { pictures} = useFetchPicturesData('1519');
    const themeColors = themes[theme] || themes.blauw;
    const [slidesToShow, setSlidesToShow] = useState(3);

    const currentUserLocation = { latitude: 50.8, longitude: 4.3333333 }; // Use real location data

    const updateSlidesToShow = () => {
        const width = window.innerWidth;
        const totalImages = images.length;

        let slides = 4;

        if (width < 1000) {
            slides = 1;
        } else if (width < 2000) {
            slides = 2;
        } else if (width < 3000) {
            slides = 3;
        }
        if (totalImages < slides){
            setSlidesToShow(totalImages);
        }
        else {
            setSlidesToShow(slides);
        }
    };

    useEffect(() => {
        if (profileData.theme){
            setTheme(profileData.theme);
        }
        if (profileData.profile_picture){
            const imageUrlWithCacheBuster = `${profileData.profile_picture}?t=${new Date().getTime()}`;
            setProfilePicture(imageUrlWithCacheBuster);
        }
        if (pictures.length > 0){
            let list_of_images = []

            for (let i = 0; i < pictures.length; i++) {
                const picture = pictures[i];
                if (picture.picture_url){
                    list_of_images.push(picture.picture_url);
                }
            }
            setImages(list_of_images)
        }
    }, [profileData.theme]);

    useEffect(() => {
        updateSlidesToShow();  // Update on initial render
        window.addEventListener('resize', updateSlidesToShow); // Listen for window resize

        return () => {
            window.removeEventListener('resize', updateSlidesToShow); // Clean up the listener
        };
    }, []);

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

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        // Haversine formula
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in kilometers

        return Math.round(distance);
    }

    const distanceToProfileUser = calculateDistance(
        currentUserLocation.latitude, currentUserLocation.longitude,
        profileData.locationData?.latitude, profileData.locationData?.longitude
    );

    let lookingForArray = profileData.looking_for;

    if (typeof profileData.looking_for === 'string') {
        try {
            lookingForArray = JSON.parse(profileData.looking_for);
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
                    color: themeColors.primary10,
                    zIndex: '0'
                }}
            >
                <ButterflyIcon color={themeColors.primary3} />

                {/* Header section with profile picture, name, age, and biography */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <Avatar
                            src={profilePicture || "https://example.com/photo.jpg"} // Fallback to default avatar
                            alt={profileData.name || "No Name"}
                            style ={{
                                minWidth: '200px',
                                minHeight: '200px',
                                borderRadius: '50%'
                            }}
                        />
                        <div>
                            <h2 style={{ margin: '0' }}>
                                {profileData.name || 'Naam'}, {calculateAge(profileData.birthdate) || 'Leeftijd'}
                            </h2>
                            <p style={{margin: '5px 0', maxWidth: '550px'}}>
                                {profileData.bio || ''}
                            </p>
                        </div>
                    </div>
                </div>

                <Divider />

                <ProfileDetail label="Locatie" value={`${profileData.locationData.gemeente} (${distanceToProfileUser} km van jou verwijdert)`} icon={<EnvironmentOutlined />} />
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
                            : "Niet beschikbaar"
                    }
                    icon={<HeartOutlined />}
                />
                <Divider />
                <ProfileDetail
                    label="Woonsituatie"
                    value={profileData.living_situation}
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
                        top: '20px',
                        right: '20px',
                        zIndex: 1000
                    }}
                >
                    Chat met {profileData?.name || 'de gebruiker'}
                </Button>
                <Divider/>
                {images.length > 0 && (
                    <>
                        <p>
                            <strong style={{width: '40%', minWidth: '150px', flexShrink: 0}}><PictureOutlined/> Meer fotos van {profileData?.name || 'de gebruiker'}: </strong>
                        </p>
                        <Carousel
                            arrows
                            slidesToShow={slidesToShow}
                            draggable
                            infinite={false}
                            style={{
                                maxWidth: '80%',
                                margin: '0 auto'
                            }}
                        >
                            {images.map((imageUrl, index) => (
                                <div key={index}>
                                    <img
                                        src={imageUrl}
                                        alt={`carousel-image-${index}`}
                                        style={{
                                            height: '250px', // Image height is set to fill the container's height
                                            width: 'auto', // This maintains the aspect ratio
                                            objectFit: 'cover', // Ensure the image covers the space without distortion
                                            borderRadius: '10px',
                                            margin: '0 auto'
                                        }}
                                    />
                                </div>
                            ))}
                        </Carousel>
                    </>
                )}
            </div>
        </ConfigProvider>
    );
};

export default ProfileCard;
