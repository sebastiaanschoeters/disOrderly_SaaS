import React, {useEffect, useState} from 'react';
import {Avatar, ConfigProvider, Divider, message, Select, Spin, Tooltip, Typography} from 'antd';
import {HeartOutlined, QuestionCircleOutlined, TrophyOutlined, UserSwitchOutlined} from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import {Avatar, Divider, Select, ConfigProvider, Spin, message, Tooltip, Typography} from 'antd';
import {
    UserSwitchOutlined,
    HeartOutlined,
    TrophyOutlined,
    QuestionCircleOutlined,
    LockOutlined
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import '../../CSS/AntDesignOverride.css';
import '../../CSS/PersonalProfilePage.css';
import {antThemeTokens, ButterflyIcon, themes} from '../../Extra components/themes';
import {createClient} from '@supabase/supabase-js';
import HomeButtonUser from "../../Extra components/HomeButtonUser";
import {calculateAge} from "../../Utils/calculations";
import {saveField} from "../../Api/Utils";
import ThemeSelector from "../../Extra components/ThemeSelector";
import useThemeOnCSS from "../../UseHooks/useThemeOnCSS";
import {fetchPendingRequestsData} from "../../Utils/requests";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const fetchPendingRequests = async (userId) => {
    return await fetchPendingRequestsData(userId);
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
    const {profileData, isLoading, error, themeTrophyEarned} = useFetchProfileData(user_id);
    const [theme, setTheme] = useState(savedTheme);
    const [isDarkMode, setIsDarkMode] = useState(savedDarkMode);
    const themeKey = isDarkMode ? `${theme}_donker` : theme;
    const themeColors = themes[themeKey] || themes.blauw;

    const [pendingRequests, setPendingRequests] = useState({});
    const [caretaker, setCaretaker] = useState({});
    const [sexuality, setSexuality] = useState('');

    const [trophies, setTrophies] = useState([
        {id: 8, title: "Win je eerste spelletje galgje", earned: false, count: 0},
        {id: 1, title: "Verstuur als eerste een bericht", earned: false},
        {id: 3, title: "Voeg drie interesses toe aan je profiel", earned: false, count: 0},
        {id: 4, title: "Voeg extra foto's toe aan je profiel", earned: false},
        {id: 5, title: "Voeg een profielfoto toe", earned: false},
        {id: 6, title: "Voeg een biografie toe aan je profiel", earned: false},
        {id: 7, title: "Verander je kleuren thema", earned: themeTrophyEarned},
    ]);

    const checkMessageSentTrophy = async (userId) => {
        const {data, error} = await supabase
            .from('Chatroom')
            .select('id, sender_id, receiver_id')
            .eq('sender_id', userId)

        if (error) throw error;

        if (data.length > 0) updateTrophyStatus(1, {earned: true});
    }

    const checkInterestsTrophy = async (userId) => {
        const {data, error} = await supabase
            .from('Interested in')
            .select('id')
            .eq('user_id', userId);

        if (error) throw error;

        const interestsCount = data.length;

        // Update trophy status with the current count
        if (interestsCount > 0) {
            updateTrophyStatus(3, { count: interestsCount }); // Update count only
        }

        // If count reaches 3 or more, mark the trophy as earned
        if (interestsCount >= 3) {
            updateTrophyStatus(3, { earned: true, count: interestsCount});
        }
    };

    const checkPicturesTrophy = async (userId) => {
        const {data, error} = await supabase
            .from('Pictures')
            .select('id')
            .eq('User_id', userId);

        if (error) throw error;

        if (data.length > 1) updateTrophyStatus(4, {earned: true}); // Added Extra Pictures
    };

    const checkProfilePictureTrophy = async (userId) => {
        const {data, error} = await supabase
            .from('User')
            .select('profile_picture')
            .eq('id', userId)
            .single();

        if (error) throw error;

        if (data.profile_picture) updateTrophyStatus(5, {earned:true}); // Profile Picture Added
    };

    const checkBioTrophy = async (userId) => {
        const {data, error} = await supabase
            .from('User information')
            .select('bio')
            .eq('user_id', userId)
            .single();

        if (error) throw error;

        if (data.bio) updateTrophyStatus(6, {earned:true}); // Bio Added
    };

    const checkHangmanWinsTrophy = async (userId) => {
        const {data, error} = await supabase
            .from('User information')
            .select('hangman_wins')
            .eq('user_id', userId)
            .single();

        if (error) throw error;

        if (data && data.hangman_wins > 0) {
            updateTrophyStatus(8, { count: data.hangman_wins , earned: true});
        }
    };

    useThemeOnCSS(themeColors);

    const updateTrophyStatus = (trophyId, updates = {}) => {
        setTrophies((prevTrophies) =>
            prevTrophies.map((trophy) =>
                trophy.id === trophyId
                    ? { ...trophy, ...updates }
                    ? {...trophy, earned: true, ...additionalData}
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
                    updateTrophyStatus(7, {earned:true});
                }
            } catch (error) {
                console.error('Error parsing theme data:', error);
            }
        }

        if (profileData.sexuality) {
            setSexuality(profileData.sexuality);
        }
        if (profileData.caretaker) {
            setCaretaker(profileData.caretaker)
        }
    }, [profileData]);

    const handleAccessLevelChange = async (caretakerId, clientId, newAccessLevel) => {
        try {
            setPendingRequests((prev) => ({...prev, [clientId]: newAccessLevel})); // Mark as pending

            // Check if a pending request already exists
            const {data: existingRequests, error: fetchError} = await supabase
                .from('Notifications')
                .select('id')
                .eq('requester_id', caretakerId)
                .eq('recipient_id', clientId)
                .eq('type', 'ACCESS_LEVEL_CHANGE');

            if (fetchError) throw fetchError;

            if (existingRequests.length > 0) {
                // If a request exists, update it
                const {error: updateError} = await supabase
                    .from('Notifications')
                    .update({
                        details: {requested_access_level: newAccessLevel},
                    })
                    .eq('id', existingRequests[0].id);

                if (updateError) throw updateError;

                message.success("Toegangsniveau wijziging verzoek bijgewerkt!");
            } else {
                // If no request exists, insert a new one
                const {error: insertError} = await supabase
                    .from('Notifications')
                    .insert([{
                        requester_id: caretakerId,
                        recipient_id: clientId,
                        type: 'ACCESS_LEVEL_CHANGE',
                        details: {requested_access_level: newAccessLevel},
                    }]);

                if (insertError) throw insertError;

                message.success("Toegangsniveau wijziging verzoek verzonden!");
            }
        } catch (error) {
            message.error("Fout bij het verzenden of bijwerken van toegangsniveau wijziging verzoek: " + error.message);

            setPendingRequests((prev) => {
                const updated = {...prev};
                delete updated[clientId]; // Remove pending status on error
                return updated;
            });
        }
    };

    const { Title } = Typography;

    const styles = {
        title: {
            flexGrow: 1,
            textAlign: 'center',
            margin: 0,
            fontSize: '48px',
            transform: 'scale(1.5)', // Scale the title up
            paddingTop: '15px',
        },
    };

    const saveThemeData = async (theme, isDarkMode) => {
        try {
            const themeData = [theme, isDarkMode]; // Ensure both theme and dark mode flag are saved together
            await saveField(user_id, 'theme', JSON.stringify(themeData));
            localStorage.setItem('theme', JSON.stringify(themeData)); // Save it as a stringified JSON array
            if (theme !== "blauw" || isDarkMode !== false) {
                updateTrophyStatus(7, { earned: true });
            }
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const handleThemeChange = async (value) => {
        setTheme(value);
        await saveThemeData(value, isDarkMode);
    };

    const handleThemeToggle = async (checked) => {
        setIsDarkMode(checked);
        await saveThemeData(theme, checked);
    };

    const handleSexualityChange = (value) => {
        setSexuality(value);
        saveField(user_id,'sexuality', value);
    };

    const tooltips = {
        "Volledige toegang": "Begeleiding heeft volledige toegang en kan alles mee volgen en profiel aanpassen",
        "Gesprekken": "Begeleiding kan enkel gesprekken lezen",
        "Contacten": "Begeleiding kan zien met wie jij contact hebt",
        "Publiek profiel": "Begeleiding kan zien wat jij op je profiel plaatst, net zoals andere gebruikers",
    };

    if (isLoading) return <Spin tip="Profiel laden..."/>;
    if (error) return <p>Failed to load profile: {error}</p>;

    return (
        <ConfigProvider theme={{token: antThemeTokens(themeColors)}}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    position: 'relative',
                    minWidth: '100dvw',
                    minHeight: '100vh',
                    overflow: 'hidden',
                    overflowX: 'hidden',
                    backgroundColor: themeColors.primary2,
                    color: themeColors.primary10,
                    boxSizing: 'border-box',
                    zIndex: '0',
                }}
            >
                <div
                    style={{
                        width: '80%',
                    }}
                >
                    <HomeButtonUser color={themeColors.primary7}/>
                    <ButterflyIcon color={themeColors.primary3}/>

                    <div style={styles.titleButton}>
                        <Title level={1} style={{...styles.title, fontSize: '64px'}}>
                            Instellingen
                        </Title>
                    </div>

                    <div
                        style={{
                            marginTop: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar
                            src={profilePicture || 'https://example.com/photo.jpg'} // Fallback to default avatar
                            alt={name || 'No Name'}
                            style={{
                                minWidth: '150px',
                                width: '12dvw',
                                minHeight: '150px',
                                height: '12dvw',
                                borderRadius: '50%',
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
                            <UserSwitchOutlined/> Begeleider met toegang
                        </strong>
                    </p>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            flexWrap: 'nowrap',
                            marginBottom: '20px',
                        }}
                    >
                        <Avatar
                            src={caretaker.profilePicture}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                flexShrink: 0,
                            }}
                        />
                        <span style={{flexGrow: 1, fontSize: '1rem', minWidth: '80px'}}>
                            {caretaker.name}
                        </span>
                        <Select
                            style={{flexGrow: 1, minWidth: '120px'}}
                            onChange={(value) =>
                                handleAccessLevelChange(user_id, profileData.caretaker.id, value)
                            }
                            value={caretaker.accessLevel}
                            options={[
                                {value: 'Volledige toegang', label: 'Volledige toegang'},
                                {value: 'Gesprekken', label: 'Gesprekken'},
                                {value: 'Contacten', label: 'Contacten'},
                                {value: 'Publiek profiel', label: 'Publiek profiel'},
                            ]}
                        />
                        <Tooltip title={tooltips[caretaker.accessLevel] || 'Geen informatie beschikbaar'}>
                            <QuestionCircleOutlined
                                style={{
                                    fontSize: '1.2rem',
                                    color: themeColors.primary8,
                                    cursor: 'pointer',
                                }}
                            />
                        </Tooltip>
                    </div>
                    {pendingRequests[caretaker.id] && (
                        <p
                            style={{
                                fontSize: '0.9rem',
                                color: themeColors.primary9,
                                marginTop: '5px',
                                textAlign: 'right',
                            }}
                        >
                            Wijziging in behandeling: {pendingRequests[caretaker.id]}
                            <Tooltip
                                title={tooltips[pendingRequests[caretaker.id]] || 'Geen informatie beschikbaar'}
                            >
                                <QuestionCircleOutlined
                                    style={{
                                        marginLeft: '3px',
                                        fontSize: '1rem',
                                        color: themeColors.primary8,
                                        cursor: 'pointer',
                                    }}
                                />
                            </Tooltip>
                        </p>
                    )}


                    <Divider/>

                    <p style={{width: '100%'}}>
                        <strong style={{display: 'block', marginBottom: '10px'}}>
                            <HeartOutlined/> Ik ben geïnteresseerd in
                        </strong>
                        <Select
                            style={{width: '100%', minWidth: '200px'}}
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
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '20px',
                            justifyContent: 'center',
                        }}
                    >
                        {trophies.map((trophy) => (
                            <div
                                className='trophy'
                                key={trophy.id}
                                style={{
                                    //flex: '0 1 calc(50% - 20px)', // Two per row by default
                                    minWidth: '350px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px',
                                    borderRadius: '15px',
                                    backgroundColor: trophy.earned ? '#fff8e1' : '#f0f0f0',
                                    border: `2px solid ${trophy.earned ? '#ffd700' : '#d9d9d9'}`,
                                    boxShadow: trophy.earned
                                        ? '0 4px 8px rgba(255, 215, 0, 0.5)'
                                        : 'none',
                                    transition: 'transform 0.3s',
                                    cursor: trophy.earned ? 'pointer' : 'default',
                                }}
                                onMouseEnter={(e) => {
                                    if (trophy.earned) e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    if (trophy.earned) e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                {/* Left Icon Section */}
                                <div style={{marginRight: '10px', display: 'flex', alignItems: 'center'}}>
                                    <div className={trophy.earned ? 'sparkle-icon' : ''}>
                                        <TrophyOutlined
                                            style={{
                                                fontSize: '2rem',
                                                color: trophy.earned ? themeColors.primary7 : themeColors.primary1,
                                                transition: 'color 0.3s',
                                            }}
                                        />
                                    </div>
                                </div>
                                {/* Right Content Section */}
                                <div>
                                    <h4
                                        style={{
                                            margin: 0,
                                            color: trophy.earned ? themeColors.primary7 : '#a0a0a0',
                                        }}
                                    >
                                        {trophy.title}
                                    </h4>
                                    {trophy.id === 8 && <p>Wins: {trophy.count}</p>}
                                    {trophy.id === 3 && <p>{trophy.count}/3</p>}
                                    {!trophy.earned && (
                                        <p style={{color: '#a0a0a0', margin: 0}}>
                                            <LockOutlined style={{marginRight: '5px'}}/>
                                            Trofee niet voltooid
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default ProfileCard;
