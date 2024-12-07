import 'antd/dist/reset.css'; // Import Ant Design styles
import '../CSS/AntDesignOverride.css';
import { ButterflyIcon, antThemeTokens, themes } from '../Extra components/themes';
import { Avatar, ConfigProvider, Input, List, Typography, Modal, Button, Slider, Radio, Checkbox } from 'antd';
import { FilterOutlined } from "@ant-design/icons";
import { createClient } from "@supabase/supabase-js";
import React, { useState, useEffect } from "react";
import HomeButtonUser from '../Extra components/HomeButtonUser'
import ProfileDetailsModal from "./Profile Pages/ProfileDetailsModal";
import useTheme from "../UseHooks/useTheme";
import useThemeOnCSS from "../UseHooks/useThemeOnCSS";
import {calculateAge, calculateDistance} from "../Utils/calculations";
import useFetchProfileData from "../UseHooks/useFetchProfileData"; // Import useNavigate for routing


// Initialize Supabase client
const supabase = createClient(
    "https://flsogkmerliczcysodjt.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q"
);

const Search = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [sortCriteria, setSortCriteria] = useState('distance');

    const [selectedClient, setSelectedClient] = useState({});
    const [isModalProfileVisible, setIsModalProfileVisible] = useState(false);

    // Filter State
    const [ageRange, setAgeRange] = useState([18, 100]);  // Set the default age range to 18-100
    const [gender, setGender] = useState('');  // Gender filter: '' for all, 'Man' or 'Vrouw'
    const [lookingFor, setLookingFor] = useState([]);  // Filter for "looking_for" options
    const [mobility, setMobility] = useState(null);  // Mobility filter: TRUE for "Ja", null for "Maakt niet uit"
    const [selectedInterests, setSelectedInterests] = useState([]);

    const { Title } = Typography;

    const [themeName, darkModeFlag] = JSON.parse(localStorage.getItem('theme')) || ['blauw', false];
    const { themeColors, setThemeName, setDarkModeFlag } = useTheme(themeName, darkModeFlag);

    const user_id = localStorage.getItem('user_id');
    const { profileData, isLoading, error} = useFetchProfileData(user_id);

    useThemeOnCSS(themeColors);

    const sortUsers = (users) => {
        if (sortCriteria === 'distance' && profileData.locationData) {
            const { latitude: userLat, longitude: userLon } = profileData.locationData;

            return [...users].sort((a, b) => {
                const distanceA = a.locationData.latitude && a.locationData.longitude
                    ? calculateDistance(userLat, userLon, a.locationData.latitude, a.locationData.longitude)
                    : Infinity;
                const distanceB = b.locationData.latitude && b.locationData.longitude
                    ? calculateDistance(userLat, userLon, b.locationData.latitude, b.locationData.longitude)
                    : Infinity;

                return distanceA - distanceB;
            });
        }

        if (sortCriteria === 'age') {
            const profileAge = calculateAge(profileData.birthdate)
            return [...users].sort((a, b) => Math.abs(a.age - profileAge) - Math.abs(b.age - profileAge));
        }

        return users;
    };


    const fetchProfileData = async (userId) => {
        try {
            // Fetch user data from 'User' table
            const { data: userData, error: userError } = await supabase
                .from('User')
                .select('id, name, birthdate, profile_picture')
                .eq('id', userId);

            if (userError) throw userError;

            if (userData.length === 0) {
                return { profileData: null, error: 'User not found' };
            }

            const user = userData[0];

            // Fetch additional user info from 'User information'
            const { data: userInfoData, error: userInfoError } = await supabase
                .from('User information')
                .select('*')
                .eq('user_id', user.id);

            if (userInfoError) throw userInfoError;

            if (userInfoData && userInfoData.length > 0) {
                const userInfo = userInfoData[0];
                user.bio = userInfo.bio;
                user.location = userInfo.location;
                user.looking_for = userInfo.looking_for;
                user.living_situation = userInfo.living_situation;
                user.mobility = userInfo.mobility;
                user.theme = userInfo.theme;
                user.gender = userInfo.gender;
                user.sexuality = userInfo.sexuality;

                // Handle theme parsing
                let parsedTheme = "blauw";
                let isDarkMode = false;
                if (userInfo.theme) {
                    try {
                        const [themeName, darkModeFlag] = JSON.parse(userInfo.theme);
                        parsedTheme = themeName;
                        isDarkMode = darkModeFlag;
                    } catch (err) {
                        console.error('Error parsing theme', err);
                    }
                }

                user.theme = isDarkMode ? `${parsedTheme}_donker` : parsedTheme;
            }

            // Fetch user's location details from 'Location' table if available
            if (user.location) {
                const { data: locationData, error: locationError } = await supabase
                    .from('Location')
                    .select('Gemeente, Longitude, Latitude')
                    .eq('id', user.location);

                if (locationError) throw locationError;

                if (locationData && locationData.length > 0) {
                    const location = locationData[0];
                    user.locationData = {
                        gemeente: location.Gemeente,
                        latitude: location.Latitude,
                        longitude: location.Longitude,
                    };
                }
            }

            // Fetch user's interests from 'Interested in' and 'Interests' table
            const { data: interestedInData, error: interestedInError } = await supabase
                .from('Interested in')
                .select('interest_id')
                .eq('user_id', user.id);

            if (interestedInError) throw interestedInError;

            if (interestedInData && interestedInData.length > 0) {
                const interestIds = interestedInData.map((item) => item.interest_id);
                const { data: interestsData, error: fetchInterestsError } = await supabase
                    .from('Interests')
                    .select('Interest')
                    .in('id', interestIds);

                if (fetchInterestsError) throw fetchInterestsError;

                user.interests = interestsData.map((interest) => ({
                    interest_name: interest.Interest,
                }));
            }

            // Return the profile data
            return { profileData: user, error: null };

        } catch (error) {
            console.error('Error fetching profile data for user:', userId, error);
            return { profileData: null, error: error.message };
        }
    };

    // Fetch users from Supabase
    const fetchUsers = async () => {
        try {
            // Fetch user data with related "User information"
            const { data: userData, error: userError } = await supabase
                .from('User')
                .select(`id`);

            if (userError) {
                console.error("Supabase Error:", userError);
                throw userError;
            }

            console.log(userData)
            // If no user data is returned, log it
            if (!userData || userData.length === 0) {
                console.log("No users found.");
                return;
            }

            // Retrieve the logged-in user's ID from localStorage
            const loggedInUserId = parseInt(localStorage.getItem('user_id'), 10); // Convert to integer

            // Filter out the logged-in user
            const filteredUserData = userData.filter(user => user.id !== loggedInUserId);

            // Add calculated age and user information to the result
            const usersWithDetails = filteredUserData.map((user) => {
                return {
                    ...user,
                };
            });

            // Fetch chatroom data
            const { data: chatroomData, error: chatroomError } = await supabase
                .from('Chatroom')
                .select(`
                sender_id,
                receiver_id
            `);

            if (chatroomError) {
                console.error("Supabase Chatroom Error:", chatroomError);
                throw chatroomError;
            }

            // Log chatroom data for debugging
            console.log("Chatroom Data:", chatroomData);

            // Create a set of excluded user IDs based on chatroom logic
            const excludedUserIds = new Set();

            chatroomData.forEach(chat => {
                if (chat.sender_id === loggedInUserId) {
                    // If logged-in user is the sender, exclude the receiver
                    excludedUserIds.add(chat.receiver_id);
                }
                if (chat.receiver_id === loggedInUserId) {
                    // If logged-in user is the receiver, exclude the sender
                    excludedUserIds.add(chat.sender_id);
                }
            });

            console.log("Excluded User IDs:", [...excludedUserIds]);

            // Filter out excluded users from the fetched user data
            const finalFilteredUserData = usersWithDetails.filter(user => !excludedUserIds.has(user.id));

            // Optional: Log the final filtered data for debugging
            console.log("Final Filtered Users:", finalFilteredUserData);

            // Array to store all users' profile data
            let users = [];

            // Iterate over each user ID and fetch profile data
            for (let i = 0; i < finalFilteredUserData.length; i++) {
                const userId = finalFilteredUserData[i].id;

                // Fetch profile data for each user
                const { profileData, isLoading, error } = await fetchProfileData(userId); // Assume `fetchProfileData` is a function that mimics `useFetchProfileData`

                if (error) {
                    console.error(`Error fetching profile data for user ${userId}:`, error);
                    continue; // Skip to the next user on error
                }

                // Add the profile data to the users array
                users.push(profileData);
            }

            const transformedUsers = transformUserData(users);

            console.log(transformedUsers)

            // Set the enriched user data
            setUsers(transformedUsers); // Set the users with their details
            setFilteredUsers(transformedUsers); // Optionally, only show users with chat history

        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false); // Set loading state to false after fetching
        }
    };

    const transformUserData = (data) => {
        const loggedInUserLocation = profileData?.locationData;

        return data.map(user => {
            let distance = null;

            if (loggedInUserLocation && user.locationData?.latitude && user.locationData?.longitude) {
                distance = calculateDistance(
                    loggedInUserLocation.latitude,
                    loggedInUserLocation.longitude,
                    user.locationData.latitude,
                    user.locationData.longitude
                );
            }

            return {
                ...user,
                age: calculateAge(new Date(user.birthdate)), // Add calculated age
                looking_for: user.looking_for ? JSON.parse(user.looking_for) : [], // Parse looking_for
                locationData: user.locationData || { gemeente: 'Onbekend', latitude: null, longitude: null }, // Fallback for location
                bio: user.bio || 'Geen beschrijving beschikbaar', // Fallback for bio
                distance: distance, // Add calculated distance (or null if not calculable)
            };
        });
    };

    const isCompatibleForRelationship = (loggedInUser, otherUser) => {
        if (!loggedInUser.gender || !loggedInUser.sexuality || !otherUser.gender || !otherUser.sexuality) {
            return false;
        }

        const otherUserInterestedInLoggedInUser =
            (loggedInUser.gender === 'Man' && otherUser.sexuality.includes('Mannen')) ||
            (loggedInUser.gender === 'Vrouw' && otherUser.sexuality.includes('Vrouwen')) ||
            otherUser.sexuality.includes('Beide');

        const loggedInUserInterestedInOtherUser =
            (otherUser.gender === 'Man' && loggedInUser.sexuality.includes('Mannen')) ||
            (otherUser.gender === 'Vrouw' && loggedInUser.sexuality.includes('Vrouwen')) ||
            loggedInUser.sexuality.includes('Beide');

        return otherUserInterestedInLoggedInUser && loggedInUserInterestedInOtherUser
    }

    // Filter Users Based on Criteria
    const applyFilters = () => {
        let filtered = [...users];

        // Filter by age range
        filtered = filtered.filter((user) => user.age >= ageRange[0] && user.age <= ageRange[1]);

        // Filter by gender (if selected)
        if (gender) {
            filtered = filtered.filter((user) => user.gender === gender);
        }

        // Filter by looking_for options
        if (lookingFor.length > 0) {
            filtered = filtered.filter((user) =>
                lookingFor.every(option => user.looking_for.includes(option))
            );

            if (lookingFor.includes('Relatie')){
                filtered = filtered.filter(user => isCompatibleForRelationship(profileData, user))
            }
        }

        // Filter by mobility
        if (mobility !== null) {
            filtered = filtered.filter((user) => user.mobility === mobility);
        }

        if (selectedInterests.length > 0) {
            filtered = filtered.filter(user =>
                user.interests?.some(interest =>
                    selectedInterests.includes(interest.interest_name)
                )
            );
        }

        const sortedUsers = sortUsers(filtered)
        setFilteredUsers(sortedUsers);
        console.log(sortedUsers)
    };

    // Handle changes for the age slider
    const handleAgeChange = (value) => {
        setAgeRange(value);
        applyFilters(); // Reapply filters whenever the age range changes
    };

    // Handle gender filter change
    const handleGenderChange = (e) => {
        setGender(e.target.value);
        applyFilters(); // Reapply filters whenever the gender changes
    };

    // Handle looking_for checkbox change
    const handleLookingForChange = (checkedValues) => {
        setLookingFor(checkedValues);
        applyFilters(); // Reapply filters whenever the looking_for options change
    };

    // Handle mobility filter change
    const handleMobilityChange = (e) => {
        setMobility(e.target.value);
        applyFilters(); // Reapply filters whenever the mobility option changes
    };

    // Placeholder for Modal
    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    const handleProfileClick = (client) => {
        console.log(client)
        setSelectedClient({id: client});
        setIsModalProfileVisible(true);
    };

    const handleModalProfileClose = () => {
        setSelectedClient({});
        setIsModalProfileVisible(false);
    };

    useEffect(() => {
        fetchUsers(); // Fetch users when the component mounts
    }, [profileData]);

    useEffect(() => {
        applyFilters(); // Reapply filters and sorting when users, filters, or sort criteria change
    }, [users, ageRange, gender, lookingFor, mobility, sortCriteria, selectedInterests]);

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div
                style={{
                    padding: '20px',
                    position: 'relative',
                    minWidth: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    minHeight: '100vh',
                    backgroundColor: themeColors.primary2,
                    color: themeColors.primary10,
                    width: '100%',
                    boxSizing: 'border-box',
                    zIndex: '0'
                }}
            >
                <HomeButtonUser color={themeColors.primary7}/>
                <ButterflyIcon color={themeColors.primary3}/>

                <Title level={2} style={{color: themeColors.primary10, marginBottom: '2vw'}}>
                    Gebruikers
                </Title>

                {/* Flex container for the search bar, filter button, and user list */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'stretch',
                        width: '70%',
                        marginBottom: '2vw',
                    }}
                >
                    {/* Search Bar and Filter Button */}
                    <div style={{flex: 1, display: 'flex', position: 'relative'}}>
                        <Input
                            placeholder="Zoek gebruikers..."
                            style={{
                                width: '100%',
                                borderRadius: '12px',
                                padding: '0.75vw 1.5vw',
                                border: `1px solid ${themeColors.primary6}`,
                            }}
                            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                        />
                        {/* Filter Icon Inside the Search Bar */}
                        <Button
                            icon={<FilterOutlined/>}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                borderRadius: '50%',
                                backgroundColor: themeColors.primary6,
                                color: themeColors.primary10,
                                border: 'none',
                                padding: '0.75vw',
                                fontSize: '1vw',
                            }}
                            onClick={showModal}
                        />
                    </div>
                </div>

                <div style={{marginBottom: '1vw', display: 'flex', flexDirection: 'row', gap: '1rem'}}>
                    <p style={{fontWeight: 'bold'}}>Sorteren op:</p>
                    <Radio.Group
                        onChange={(e) => {
                            setSortCriteria(e.target.value);
                            applyFilters();
                        }}
                        value={sortCriteria}
                        style={{ marginBottom: '1vw', display: 'flex', flexDirection: 'row', gap: '1rem' }}
                    >
                        <Radio value="distance">Afstand</Radio>
                        <Radio value="age">Leeftijd</Radio>
                    </Radio.Group>

                </div>


                {loading ? (
                    <div>Gebruikers aan het zoeken...</div>
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            width: '70%',
                        }}
                    >
                        {/* Check if there are users to display */}
                        {filteredUsers.filter(
                            (user) =>
                                user.name.toLowerCase().includes(searchQuery) ||
                                user.age.toString().includes(searchQuery)
                        ).length === 0 ? (
                            <div
                                style={{
                                    textAlign: 'center',
                                    marginTop: '2vw',
                                }}
                            >
                                Geen gebruikers gevonden voor deze zoek criteria.<br/> Pas je filters aan en probeer opnieuw.
                            </div>
                        ) : (
                            <List
                                style={{
                                    flex: 1,
                                    width: '70%',
                                    maxWidth: '100%',
                                }}
                                dataSource={filteredUsers.filter(
                                    (user) =>
                                        user.name.toLowerCase().includes(searchQuery) ||
                                        user.age.toString().includes(searchQuery)
                                )}
                                renderItem={(item) => (
                                    <List.Item
                                        key={item.id}
                                        onClick={() => handleProfileClick(item.id)}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            marginBottom: '1.5vw',
                                            padding: '1vw',
                                            backgroundColor: themeColors.primary1,
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                            justifyContent: 'space-between',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <Avatar
                                            src={item.profile_picture}
                                            style={{
                                                backgroundColor: themeColors.primary10,
                                                marginLeft: '1vw',
                                                width: '10vw',
                                                height: '10vw',
                                            }}
                                        >
                                            {item.name[0]}
                                        </Avatar>
                                        <div
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                                marginRight: '1vw',
                                            }}
                                        >
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontWeight: 'bold' }}>{item.name}</p>
                                                <p>Leeftijd: {item.age}</p>
                                                <p>Afstand: {item.distance}km</p>
                                            </div>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        )}
                    </div>
                )}


                {selectedClient && (
                    <ProfileDetailsModal
                        visible={isModalProfileVisible}
                        onClose={handleModalProfileClose}
                        clientData={selectedClient}
                    />
                )}


                {/* Modal for Filters */}
                <Modal
                    title="Filteren"
                    open={isModalVisible}
                    onCancel={handleModalClose}
                    footer={null}  // Remove the footer buttons
                >
                    <div style={{marginBottom: '1vw'}}>
                        {/* Age Range Text */}
                        <p style={{fontWeight: 'bold'}}>
                            Leeftijd {ageRange[0]} - {ageRange[1]}
                        </p>
                        <Slider
                            range
                            min={18}
                            max={100}
                            defaultValue={ageRange}
                            onChange={handleAgeChange}
                            value={ageRange}
                        />
                    </div>
                    <div style={{marginBottom: '1vw'}}>
                        <p style={{fontWeight: 'bold'}}>Geslacht</p>
                        <Radio.Group onChange={handleGenderChange} value={gender}
                                     style={{display: 'flex', flexDirection: 'row'}}>
                            <Radio value="Man">
                                <Typography.Text>Man</Typography.Text>
                            </Radio>
                            <Radio value="Vrouw">
                                <Typography.Text>Vrouw</Typography.Text>
                            </Radio>
                            <Radio value="Non-binair">
                                <Typography.Text>Non-binair</Typography.Text>
                            </Radio>
                            <Radio value="">
                                <Typography.Text>Maakt niet uit</Typography.Text>
                            </Radio>
                        </Radio.Group>
                    </div>
                    <div style={{marginBottom: '1vw'}}>
                        <p style={{fontWeight: 'bold'}}>Zoekt naar</p>
                        <Checkbox.Group
                            options={['Relatie', 'Vrienden', 'Intieme ontmoeting']}
                            value={lookingFor}
                            onChange={handleLookingForChange}
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                            }}
                        />
                    </div>
                    <div style={{marginBottom: '1vw'}}>
                        <p style={{fontWeight: 'bold'}}>Kan zich zelfstanding verplaatsen</p>
                        <Radio.Group onChange={handleMobilityChange} value={mobility}
                                     style={{display: 'flex', flexDirection: 'row'}}>
                            <Radio value={true}>
                                <Typography.Text>Ja</Typography.Text>
                            </Radio>
                            <Radio value={null}>
                                <Typography.Text>Maakt niet uit</Typography.Text>
                            </Radio>
                        </Radio.Group>
                    </div>
                    <div style={{marginBottom: '1vw'}}>
                        <p style={{fontWeight: 'bold'}}>Interesses</p>
                        {profileData?.interests?.length > 0 ? (
                            <Checkbox.Group
                                options={profileData.interests.map(interest => interest.interest_name)}
                                value={selectedInterests}
                                onChange={setSelectedInterests}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                    gap: '10px',
                                }}
                            />
                        ) : (
                            <p style={{fontStyle: 'italic'}}>
                                Voeg eerst je eigen interesses toe.
                            </p>
                        )}
                    </div>
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default Search;
