import React, { useState, useEffect } from 'react';
import {Tag, Avatar, Button,Input, Modal, Divider, ConfigProvider, Spin, Carousel} from 'antd';
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
import '../../CSS/AntDesignOverride.css';
import { ButterflyIcon, antThemeTokens, themes } from '../../themes';
import {useLocation, useNavigate} from 'react-router-dom';

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
    const [pictures, setPictures] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: picturesData, error: userError } = await supabase
                    .from('Pictures')
                    .select('*')
                    .eq('User_id', actCode);

                if (userError) throw userError;
                setPictures(picturesData || []);
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [actCode]);

    return { pictures, isLoading, error };
};

const useFetchUserLocation = (actCode) => {
    const [locationData, setLocationData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const { data: userInfoData, error: userInfoError } = await supabase
                    .from('User information')
                    .select('location')
                    .eq('user_id', actCode);

                if (userInfoError) throw userInfoError;

                if (userInfoData && userInfoData.length > 0 && userInfoData[0].location) {
                    const locationId = userInfoData[0].location;

                    const { data: locationDetails, error: locationError } = await supabase
                        .from('Location')
                        .select('Gemeente, Longitude, Latitude')
                        .eq('id', locationId);

                    if (locationError) throw locationError;

                    if (locationDetails && locationDetails.length > 0) {
                        setLocationData(locationDetails[0]);
                    }
                }
            } catch (error) {
                setError(error.message);
            }
        };

        fetchLocation();
    }, [actCode]);

    return { locationData, error };
};

const ProfileDetail = ({ label, value, icon }) => (
    <p style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '5px'}}>
        <strong style={{ width: '20%', minWidth: '150px', flexShrink: 0 }}>{icon} {label}: </strong>
        <span style={{ flexWrap: 'wrap' }}>{value || 'Niet beschikbaar'}</span>
    </p>
);

const CustomPrevArrow = ({ onClick }) => (
    <Button
        type="default"
        shape="circle"
        icon={<LeftOutlined />}
        onClick={onClick}
        style={{
            position: 'absolute',
            top: '50%',
            left: '-40px',
            transform: 'translateY(-50%)',
            zIndex: 10,
        }}
    />
);

const CustomNextArrow = ({ onClick }) => (
    <Button
        type="default"
        shape="circle"
        icon={<RightOutlined />}
        onClick={onClick}
        style={{
            position: 'absolute',
            top: '50%',
            right: '-40px',
            transform: 'translateY(-50%)',
            zIndex: 10,
        }}
    />
);

const ProfileCard = (profileToShow) => {

    const viewedByCaretaker = profileToShow.viewedByCareteaker

    const { profileData, isLoading, error } = useFetchProfileData(profileToShow.user_id);
    const { pictures } = useFetchPicturesData(profileToShow.user_id);
    const { locationData } = useFetchUserLocation(localStorage.getItem('user_id'));

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [isChatroomExistent, setChatroomExistent] = useState(false); // State to track chatroom existence
    const navigate = useNavigate();

    const imageUrls = pictures
        .filter(picture => picture.picture_url)
        .map(picture => picture.picture_url);

    // Simplified slides calculation
    const calculateSlidesToShow = (imageCount) => {
        const width = window.innerWidth;
        let slides = 5.5;

        if (width < 700) slides = 1;
        else if (width < 1100) slides = 1.5;
        else if (width < 1500) slides = 2.5;
        else if (width < 2000) slides = 3.5;
        else if (width < 3000) slides = 4.5;

        return Math.min(slides, imageCount);
    };

    const [slidesToShow, setSlidesToShow] = useState(calculateSlidesToShow(imageUrls.length))

    useEffect(() => {
        const handleResize = () => {
            setSlidesToShow(calculateSlidesToShow(imageUrls.length));
        };

        window.addEventListener('resize', handleResize);

        // Cleanup on unmount
        return () => window.removeEventListener('resize', handleResize);
    }, [imageUrls.length]);

    // Calculate age
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

    // Distance calculation
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return Math.round(distance);
    };

    // Parse looking for array
    const parseLookingForArray = (lookingFor) => {
        if (typeof lookingFor === 'string') {
            try {
                return JSON.parse(lookingFor);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return [];
            }
        }
        return lookingFor || [];
    };

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

    // Current user location (with fallback)
    const currentUserLocation = locationData
        ? { latitude: locationData.Latitude, longitude: locationData.Longitude }
        : { latitude: 50.8, longitude: 4.3333333 };

    // Profile picture
    const profilePicture = profileData.profile_picture
        ? `${profileData.profile_picture}?t=${new Date().getTime()}`
        : "https://example.com/photo.jpg";

    // Distance calculation
    const distanceToProfileUser = calculateDistance(
        currentUserLocation.latitude,
        currentUserLocation.longitude,
        profileData.locationData?.latitude,
        profileData.locationData?.longitude
    );

    const handleMessage = async () => {
        setIsModalVisible(true);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const senderId = parseInt(localStorage.getItem('user_id'), 10);
            const receiverId = profileToShow.user_id;

            // Insert into Chatroom table and return the 'id' of the newly inserted row
            const { data: chatroomData, error: chatroomError } = await supabase
                .from('Chatroom')
                .insert([{
                    sender_id: senderId,
                    receiver_id: receiverId,
                    acceptance: false,
                    last_sender_id: senderId
                }])
                .select('id')  // Specify the column(s) to return (in this case, 'id')

            if (chatroomError) {
                console.error('Error inserting chatroom:', chatroomError);
                throw chatroomError;
            }

            // Ensure the ID is available
            const chatroomId = chatroomData?.[0]?.id;

            if (!chatroomId) {
                console.error('Chatroom ID is missing');
                return;  // Exit early if the ID is missing
            }

            console.log('Chatroom created with ID:', chatroomId);

            // Insert the message into the Messages table
            const { data: messageData, error: messageError } = await supabase
                .from('Messages')
                .insert([{
                    sender_id: senderId,
                    chatroom_id: chatroomId,
                    message_content: newMessage,
                }]);

            if (messageError) {
                console.error('Error inserting message:', messageError);
                throw messageError;
            }

            // Hide the modal, clear the message, and navigate to the chatroom
            setIsModalVisible(false);
            setNewMessage('');
            setChatroomExistent(true);


        } catch (error) {
            console.error('Error sending message or inserting data:', error);
            // Optionally handle user-friendly error messaging
        }
    };

    useEffect(() => {
        const checkChatroom = async () => {
            const senderId = parseInt(localStorage.getItem('user_id'), 10);
            const receiverId = profileToShow.user_id;

            try {
                // Check if the chatroom exists between sender and receiver
                const { data: chatroomData, error } = await supabase
                    .from('Chatroom')
                    .select('id')
                    .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
                    .single();

                if (error) {
                    console.error('Error fetching chatroom:', error);
                    return;
                }

                // If chatroomData is found, set the state to true
                setChatroomExistent(!!chatroomData);
            } catch (error) {
                console.error('Error checking chatroom:', error);
            }
        };

        checkChatroom();
    }, [profileToShow.user_id]);

    const handleCancel = () => {
        setIsModalVisible(false);
        setNewMessage('');
    };

    if (isLoading) return <Spin tip="Profiel laden..." />;
    if (error) return <p>Failed to load profile: {error}</p>;

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

                {
                    !viewedByCaretaker ? (
                        <ProfileDetail
                            label="Locatie"
                            value={`${profileData.locationData?.gemeente} (${distanceToProfileUser}km van jou verwijderd)`}
                            icon={<EnvironmentOutlined />}
                        />
                    ) : (
                        <ProfileDetail
                            label="Locatie"
                            value={`${profileData.locationData?.gemeente}`}
                        />
                    )
                }


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
                        parseLookingForArray(profileData.looking_for)
                            .map((option, index) => <Tag key={index}>{option}</Tag>)}
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

                {!viewedByCaretaker && (
                    <Button
                        type="primary"
                        icon={<MessageOutlined />}
                        style={{
                            position: 'fixed',
                            top: '20px',
                            right: '20px',
                            zIndex: 1000
                        }}
                        disabled={isChatroomExistent}
                        onClick={handleMessage}
                    >
                        {isChatroomExistent ? 'chat is al gestart' : `Chat met ${profileData?.name || 'de gebruiker'}`}
                    </Button>
                )}

                <Divider/>

                {imageUrls.length > 0 && (
                    <Carousel
                        prevArrow={<CustomPrevArrow />}
                        nextArrow={<CustomNextArrow />}
                        arrows
                        slidesToShow={slidesToShow}
                        draggable
                        infinite={false}
                        style={{
                            maxWidth: '80%',
                            margin: '0 auto'
                        }}
                    >
                        {imageUrls.map((imageUrl, index) => (
                            <div
                                key={index}
                                style={{
                                    position: 'relative',
                                    height: '200px',
                                }}
                            >
                                <img
                                    src={imageUrl}
                                    alt={`carousel-image-${index}`}
                                    style={{
                                        height: '200px', // Image height is set to fill the container's height
                                        width: 'auto', // This maintains the aspect ratio
                                        objectFit: 'cover', // Ensure the image covers the space without distortion
                                        borderRadius: '10px',
                                        margin: '0 auto'
                                    }}
                                />
                            </div>
                        ))}
                    </Carousel>
                )}

                {!viewedByCaretaker && (
                    <Modal
                        title={`Chat met ${profileData.name || 'de gebruiker'}`}
                        visible={isModalVisible}
                        onCancel={handleCancel}
                        footer={[
                            <Button key="send" type="primary" onClick={handleSendMessage} >
                                Verzenden
                            </Button>,
                        ]}
                    >
                        <Input.TextArea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            rows={4}
                            placeholder="Typ je bericht..."
                        />
                    </Modal>
                )}
            </div>
        </ConfigProvider>
    );
};

export default ProfileCard;
