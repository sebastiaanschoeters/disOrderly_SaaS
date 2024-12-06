import React, { useEffect, useState } from 'react';
import {Avatar, Divider, Select, ConfigProvider, Spin, message} from 'antd';
import { UserSwitchOutlined, HeartOutlined, TrophyOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import '../../CSS/AntDesignOverride.css';
import '../../CSS/PersonalProfilePage.css';
import {antThemeTokens, ButterflyIcon, themes} from '../../Extra components/themes';
import { createClient } from '@supabase/supabase-js';
import HomeButtonUser from "../../Extra components/HomeButtonUser";
import {calculateAge} from "../../Utils/calculations";
import {debounce, saveField} from "../../Api/Utils";
import ThemeSelector from "../../Extra components/ThemeSelector";
import useThemeOnCSS from "../../UseHooks/useThemeOnCSS";

const supabase = createClient(
    'https://flsogkmerliczcysodjt.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q'
);

const fetchPendingRequests = async (caretakerId) => {
    try {
        const { data, error } = await supabase
            .from('Notifications')
            .select('recipient_id, details')
            .eq('requester_id', caretakerId)
            .eq('type', 'ACCESS_LEVEL_CHANGE');

        if (error) throw error;

        // Map the data to a format usable by the state
        return data.reduce((acc, request) => {
            acc[request.recipient_id] = request.details.requested_access_level;
            return acc;
        }, {});
    } catch (error) {
        console.error('Error fetching pending requests:', error.message);
        return {};
    }
};

const useFetchProfileData = (actCode) => {
    const [profileData, setProfileData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [themeTrophyEarned, setThemeTrophyEarned] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user data
                const { data: userData, error: userError } = await supabase
                    .from('User')
                    .select('id, name, birthdate, profile_picture, caretaker, access_level')
                    .eq('id', actCode);

                if (userError) throw userError;
                if (userData.length > 0) {
                    const user = userData[0];

                    // Fetch user information
                    const { data: userInfoData, error: userInfoError } = await supabase
                        .from('User information')
                        .select('theme, sexuality')
                        .eq('user_id', user.id);

                    if (userInfoError) throw userInfoError;

                    let parsedTheme = 'blauw';
                    let isDarkMode = false;

                    if (userInfoData && userInfoData.length > 0) {
                        const userInfo = userInfoData[0];
                        user.theme = userInfo.theme;
                        user.sexuality = userInfo.sexuality;

                        if (userInfo.theme) {
                            try {
                                const [themeName, darkModeFlag] = JSON.parse(userInfo.theme);
                                parsedTheme = themeName;
                                isDarkMode = darkModeFlag;

                                if (themeName !== "blauw" || isDarkMode !== false){
                                    setThemeTrophyEarned(true);
                                }

                            } catch (error) {
                                console.error('Error parsing theme', error);
                            }
                        }
                    }

                    const {data: caretakerInfo, error: cartakerInfoError}= await supabase
                        .from('Caretaker')
                        .select('name, profile_picture, id')
                        .eq('id', user.caretaker)

                    if (caretakerInfo.length > 0){
                        const caretaker = caretakerInfo[0];
                        user.caretaker = {id: caretaker.id, name: caretaker.name, profilePicture: caretaker.profile_picture, accessLevel: user.access_level}
                    }

                    // Set the user profile data with the theme
                    setProfileData({
                       ...user,
                        theme: [parsedTheme, isDarkMode]
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

    return { profileData, isLoading, error, themeTrophyEarned };
};

const ProfileCard = () => {
    const user_id = localStorage.getItem('user_id')

    const name = localStorage.getItem('name')

    const profilePicture = localStorage.getItem('profile_picture')

    let [savedTheme, savedDarkMode] = JSON.parse(localStorage.getItem('theme'));
    const { profileData, isLoading, error, themeTrophyEarned } = useFetchProfileData(user_id);
    const [theme, setTheme] = useState(savedTheme);
    const [isDarkMode, setIsDarkMode] = useState(savedDarkMode);
    const themeKey = isDarkMode ? `${theme}_donker` : theme;
    const themeColors = themes[themeKey] || themes.blauw;

    const [pendingRequests, setPendingRequests] = useState({});
    const [caretaker, setCaretaker] = useState({});
    const [sexuality, setSexuality] = useState('');

    const [trophies, setTrophies] = useState([
        { id: 8, title: "Win je eerste spelletje galgje", earned: false, count: 0 },
        { id: 1, title: "Verstuur als eerste een bericht", earned: false },
        { id: 3, title: "Voeg drie interesses toe aan je profiel", earned: false, count: 0 },
        { id: 4, title: "Voeg extra foto's toe aan je profiel", earned: false },
        { id: 5, title: "Voeg een profielfoto toe", earned: false },
        { id: 6, title: "Voeg een biografie toe aan je profiel", earned: false },
        { id: 7, title: "Verander je thema van de standaard kleuren", earned: themeTrophyEarned },
    ]);

    const checkMessageSentTrophy = async (userId) => {
        const { data, error } = await supabase
            .from('Chatroom')
            .select('id, sender_id, receiver_id')
            .eq('sender_id', userId)

        if (error) throw error;

        if (data.length > 0) updateTrophyStatus(1);
    }

    const checkInterestsTrophy = async (userId) => {
        const { data, error } = await supabase
            .from('Interested in')
            .select('id')
            .eq('user_id', userId);

        console.log("InterestsTrophies: ", data);
        if (error) throw error;

        const interestsCount = data.length;
        if (interestsCount >= 3) {
            updateTrophyStatus(3,{count:  interestsCount} ); // Interests Added, with count
        }
    };

    const checkPicturesTrophy = async (userId) => {
        const { data, error } = await supabase
            .from('Pictures')
            .select('id')
            .eq('User_id', userId);

        console.log("PicturesTrophies: ", data);
        if (error) throw error;

        if (data.length > 1) updateTrophyStatus(4); // Added Extra Pictures
    };

    const checkProfilePictureTrophy = async (userId) => {
        const { data, error } = await supabase
            .from('User')
            .select('profile_picture')
            .eq('id', userId)
            .single();

        console.log("Profile Picture Trophies: ", data);
        if (error) throw error;

        if (data.profile_picture) updateTrophyStatus(5); // Profile Picture Added
    };

    const checkBioTrophy = async (userId) => {
        const { data, error } = await supabase
            .from('User information')
            .select('bio')
            .eq('user_id', userId)
            .single();

        console.log("BioTrophies: ", data);
        if (error) throw error;

        if (data.bio) updateTrophyStatus(6); // Bio Added
    };

    const checkHangmanWinsTrophy = async (userId) => {
        const { data, error } = await supabase
            .from('User information')
            .select('hangman_wins')
            .eq('user_id', userId)
            .single();

        console.log("HangmanTrophies: ", data);
        if (error) throw error;

        if (data && data.hangman_wins>0) {
            updateTrophyStatus(8, { count: data.hangman_wins });
        }
    };

    useThemeOnCSS(themeColors);

    const updateTrophyStatus = (trophyId, additionalData = {}) => {
        setTrophies((prevTrophies) =>
            prevTrophies.map((trophy) =>
                trophy.id === trophyId
                    ? { ...trophy, earned: true, ...additionalData }
                    : trophy
            )
        );
    };

    useEffect(() => {
        const checkTrophies = async () => {
            await checkMessageSentTrophy(user_id);
            await checkInterestsTrophy(user_id);
            await checkPicturesTrophy(user_id);
            await checkProfilePictureTrophy(user_id);
            await checkBioTrophy(user_id);
            await checkHangmanWinsTrophy(user_id);
        };

        checkTrophies();
    }, [user_id]);


    useEffect(() => {
        const initializeNotifications = async () => {
            if (user_id) {
                const pending = await fetchPendingRequests(user_id);
                setPendingRequests(pending);
            }
        };

        initializeNotifications();
    }, [profileData]);

    // Set theme and dark mode when profileData changes
    useEffect(() => {
        if (profileData.theme) {
            try {
                const [savedTheme, darkModeFlag] = profileData.theme;
                setTheme(savedTheme);
                setIsDarkMode(darkModeFlag);
                if (savedTheme !== "blauw" || darkModeFlag !== false){
                    updateTrophyStatus(7);
                }
            } catch (error) {
                console.error('Error parsing theme data:', error);
            }
        }

        if (profileData.sexuality) {
            setSexuality(profileData.sexuality);
        }
        if (profileData.caretaker){
            setCaretaker(profileData.caretaker)
        }
    }, [profileData]);

    const debouncedSaveTheme = debounce(async (newTheme, darkModeFlag) => {
        try {
            const themeData = [newTheme, darkModeFlag]; // Ensure both theme and dark mode flag are saved together
            await saveField(user_id, 'theme', JSON.stringify(themeData));
            localStorage.setItem('theme',JSON.stringify(themeData))// Save it as a stringified JSON array
            if (newTheme !== "blauw" || darkModeFlag !== false) {
                updateTrophyStatus(7);
            }
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    }, 500);

    const debouncedSaveSexuality = debounce((value) => saveField(user_id,'sexuality', value), 1000);

    const handleAccessLevelChange = async (caretakerId, clientId, newAccessLevel) => {
        try {
            setPendingRequests((prev) => ({ ...prev, [clientId]: newAccessLevel })); // Mark as pending

            // Check if a pending request already exists
            const { data: existingRequests, error: fetchError } = await supabase
                .from('Notifications')
                .select('id')
                .eq('requester_id', caretakerId)
                .eq('recipient_id', clientId)
                .eq('type', 'ACCESS_LEVEL_CHANGE');

            if (fetchError) throw fetchError;

            if (existingRequests.length > 0) {
                // If a request exists, update it
                const { error: updateError } = await supabase
                    .from('Notifications')
                    .update({
                        details: { requested_access_level: newAccessLevel },
                    })
                    .eq('id', existingRequests[0].id);

                if (updateError) throw updateError;

                message.success("Toegangsniveau wijziging verzoek bijgewerkt!");
            } else {
                // If no request exists, insert a new one
                const { error: insertError } = await supabase
                    .from('Notifications')
                    .insert([{
                        requester_id: caretakerId,
                        recipient_id: clientId,
                        type: 'ACCESS_LEVEL_CHANGE',
                        details: { requested_access_level: newAccessLevel },
                    }]);

                if (insertError) throw insertError;

                message.success("Toegangsniveau wijziging verzoek verzonden!");
            }
        } catch (error) {
            message.error("Fout bij het verzenden of bijwerken van toegangsniveau wijziging verzoek: " + error.message);

            setPendingRequests((prev) => {
                const updated = { ...prev };
                delete updated[clientId]; // Remove pending status on error
                return updated;
            });
        }
    };


    const handleThemeChange = (value) => {
        setTheme(value);
        debouncedSaveTheme(value, isDarkMode); // Save theme with dark mode flag
    };

    const handleThemeToggle = (checked) => {
        setIsDarkMode(checked);
        debouncedSaveTheme(theme, checked); // Save theme with dark mode flag
    };

    const handleSexualityChange = (value) => {
        setSexuality(value);
        debouncedSaveSexuality(value);
    };

    if (isLoading) return <Spin tip="Profiel laden..." />;
    if (error) return <p>Failed to load profile: {error}</p>;

    return (
        <ConfigProvider theme={{token: antThemeTokens(themeColors)}}>
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
                <HomeButtonUser color={themeColors.primary7}/>
                <ButterflyIcon color={themeColors.primary3}/>

                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <Avatar
                        src={profilePicture || "https://example.com/photo.jpg"} // Fallback to default avatar
                        alt={name || "No Name"}
                        style={{
                            minWidth: '150px',
                            width: '12dvw',
                            minHeight: '150px',
                            height: '12dvw',
                            borderRadius: '50%'
                        }}
                    >
                        <h2>{name[0]}</h2>
                    </Avatar>
                    <h2 style={{margin: '0', textAlign: 'center'}}>
                        {name || 'Naam'}, {calculateAge(profileData.birthdate) || 'Leeftijd'}
                    </h2>
                    <Divider/>
                </div>

                <ThemeSelector
                    theme={theme}
                    isDarkMode={isDarkMode}
                    handleThemeChange={handleThemeChange}
                    handleThemeToggle={handleThemeToggle}
                />

                <Divider/>

                <p>
                    <strong>
                        <UserSwitchOutlined/> Begeleiding met toegang:
                    </strong>
                </p>

                <p style={{display: 'flex', alignItems: 'center', gap: '2%', marginBottom: '20px'}}>
                    <div style={{width: '20%', minWidth: '150px'}}>
                        <Avatar src={caretaker.profilePicture}
                                style={{width: '40px', height: '40px', objectFit: 'cover', marginRight: '15px'}}/>
                        <span>{caretaker.name}</span>
                    </div>

                    <Select
                        style={{flex: 1, minWidth: '200px'}}
                        onChange={(value) => handleAccessLevelChange(user_id, profileData.caretaker.id, value)}
                        value={caretaker.accessLevel}
                        options={[
                            {value: 'Volledige toegang', label: 'Volledige toegang'},
                            {value: 'Gesprekken', label: 'Gesprekken'},
                            {value: 'Contacten', label: 'Contacten'},
                            {value: 'Publiek profiel', label: 'Publiek profiel'},
                        ]}
                    />
                    {pendingRequests[caretaker.id] && (
                        <p style={{color: themeColors.primary9, marginTop: '5px'}}>
                            Wijziging in behandeling: {pendingRequests[caretaker.id]}
                        </p>
                    )}
                </p>

                <Divider/>

                <p style={{display: 'flex', alignItems: 'center', width: '100%', gap: '2%'}}>
                    <strong style={{width: '20%', minWidth: '150px'}}>
                        <HeartOutlined/> Ik ben geïntereseerd in:
                    </strong>
                    <Select
                        style={{flex: 1, minWidth: '200px'}}
                        placeholder="Selecteer seksualiteit"
                        value={sexuality}
                        options={[
                            {value: 'Mannen', label: 'Mannen'},
                            {value: 'Vrouwen', label: 'Vrouwen'},
                            {value: 'Beide', label: 'Beide'},
                        ]}
                        onChange={handleSexualityChange}

                    />
                </p>

                <Divider/>

                <p>
                    <strong>
                        <TrophyOutlined/> Trofeeën
                    </strong>
                </p>
                <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    {trophies.map((trophy) => (
                        <div key={trophy.id} style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <div className={trophy.earned ? "sparkle-icon" : ""}>
                                    <TrophyOutlined
                                        style={{
                                            fontSize: '2rem',
                                            color: trophy.earned ? themeColors.primary7 : themeColors.primary1,
                                            transition: 'color 0.3s',
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <h4>{trophy.title}</h4>
                                {trophy.id === 8 && <p>Wins: {trophy.count}</p>}
                                {trophy.id === 3 && <p>{trophy.count}/3</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ConfigProvider>
    )
        ;
};

export default ProfileCard;
