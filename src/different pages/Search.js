import 'antd/dist/reset.css'; // Import Ant Design styles
import '../CSS/AntDesignOverride.css';
import { ButterflyIcon, antThemeTokens, themes } from '../Extra components/themes';
import { Avatar, ConfigProvider, Input, List, Typography, Modal, Button, Slider, Radio, Checkbox } from 'antd';
import { FilterOutlined } from "@ant-design/icons";
import { createClient } from "@supabase/supabase-js";
import React, { useState, useEffect } from "react";
import HomeButtonUser from '../Extra components/HomeButtonUser'
import { useNavigate } from 'react-router-dom';
import ClientDetailsModal from "./Caretaker and Admin/ClientDetailsModal";
import ProfileDetailsModal from "./Profile Pages/ProfileDetailsModal";
import useTheme from "../UseHooks/useTheme";
import useThemeOnCSS from "../UseHooks/useThemeOnCSS"; // Import useNavigate for routing


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

    const [selectedClient, setSelectedClient] = useState({});
    const [isModalProfileVisible, setIsModalProfileVisible] = useState(false);

    // Filter State
    const [ageRange, setAgeRange] = useState([18, 100]);  // Set the default age range to 18-100
    const [gender, setGender] = useState('');  // Gender filter: '' for all, 'Man' or 'Vrouw'
    const [lookingFor, setLookingFor] = useState([]);  // Filter for "looking_for" options
    const [mobility, setMobility] = useState(null);  // Mobility filter: TRUE for "Ja", null for "Maakt niet uit"

    const { Title } = Typography;

    const [themeName, darkModeFlag] = JSON.parse(localStorage.getItem('theme')) || ['blauw', false];
    const { themeColors, setThemeName, setDarkModeFlag } = useTheme(themeName, darkModeFlag);

    useThemeOnCSS(themeColors);

    // Helper function to calculate age from birthdate
    const calculateAge = (birthdate) => {
        const birthDateObj = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const month = today.getMonth();
        if (month < birthDateObj.getMonth() || (month === birthDateObj.getMonth() && today.getDate() < birthDateObj.getDate())) {
            age--;
        }
        return age;
    };

    // Fetch users from Supabase
    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('User')
                .select(`
                id,
                name,
                birthdate,
                profile_picture,
                "User information" (gender, looking_for, mobility)
            `);

            if (error) {
                console.error("Supabase Error:", error);
                throw error;
            }

            // If no data is returned, log it
            if (!data || data.length === 0) {
                console.log("No users found.");
                return;
            }

            // Retrieve the logged-in user's ID from localStorage
            const loggedInUserId = parseInt(localStorage.getItem('user_id'), 10); // Convert to integer

            // Filter out the user whose ID matches the logged-in user's ID
            const filteredData = data.filter(user => user.id !== loggedInUserId);
            console.log(loggedInUserId);
            console.log(filteredData);
            // Add calculated age and user information to the result
            const usersWithDetails = filteredData.map((user) => {
                const age = calculateAge(user.birthdate); // Calculate age based on birthdate
                const { gender, looking_for, mobility } = user["User information"] || {}; // Handle missing user_information

                return {
                    ...user,
                    age,
                    gender: gender || '',
                    looking_for: looking_for || [],
                    mobility: mobility || null
                };
            });

            setUsers(usersWithDetails); // Set the users with their details
            setFilteredUsers(usersWithDetails); // Set filtered users based on the fetched data

        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false); // Set loading state to false after fetching
        }
    };



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
        }

        // Filter by mobility
        if (mobility !== null) {
            filtered = filtered.filter((user) => user.mobility === mobility);
        }

        setFilteredUsers(filtered);
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
    }, []);

    useEffect(() => {
        applyFilters(); // Apply filters when users data is loaded
    }, [users, ageRange, gender, lookingFor, mobility]); // Apply filters when users or filters change

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
                <HomeButtonUser color={themeColors.primary7} />
                <ButterflyIcon color={themeColors.primary3} />

                <Title level={2} style={{ color: themeColors.primary10, marginBottom: '2vw' }}>
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
                    <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
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
                            icon={<FilterOutlined />}
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

                {loading ? (
                    <div>Loading...</div>
                ) : filteredUsers.length > 0 ? (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            width: '70%',
                        }}
                    >
                        {/* User List */}
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
                                        // Navigate to dynamic user link
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        marginBottom: '1.5vw', // Reduced margin between items
                                        padding: '1vw', // Reduced padding for smaller list items
                                        backgroundColor: themeColors.primary4,
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                        justifyContent: 'space-between',
                                        cursor: 'pointer', // Add pointer cursor to indicate it's clickable
                                    }}
                                >
                                    <Avatar
                                        src={item.profile_picture}
                                        style={{
                                            backgroundColor: themeColors.primary10,
                                            marginRight: '1.5vw', // Reduced margin
                                            width: '3rem', // Reduced avatar size
                                            height: '3rem', // Reduced avatar size
                                        }}
                                    >
                                        {item.name[0]}
                                    </Avatar>
                                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: 'bold' }}>
                                                {item.name}
                                            </p>
                                            <p>Leeftijd: {item.age}</p>
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </div>
                ) : (
                    <div>Geen gebruikers gevonden.</div>
                )}

                {selectedClient && (
                    <ProfileDetailsModal
                        visible={isModalProfileVisible}
                        onClose={handleModalClose}
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
                    <div style={{ marginBottom: '1vw' }}>
                        {/* Age Range Text */}
                        <p style={{ fontWeight: 'bold' }}>
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
                    <div style={{ marginBottom: '1vw' }}>
                        <p style={{ fontWeight: 'bold' }} >Geslacht</p>
                        <Radio.Group onChange={handleGenderChange} value={gender} style={{ display: 'flex', flexDirection: 'row' }}>
                            <Radio value="Man">
                                <Typography.Text>Man</Typography.Text>
                            </Radio>
                            <Radio value="Vrouw">
                                <Typography.Text>Vrouw</Typography.Text>
                            </Radio>
                            <Radio value="">
                                <Typography.Text>Maakt niet uit</Typography.Text>
                            </Radio>
                        </Radio.Group>
                    </div>
                    <div style={{ marginBottom: '1vw' }}>
                        <p style={{ fontWeight: 'bold' }}>Zoekt naar</p>
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
                    <div style={{ marginBottom: '1vw' }}>
                        <p style={{fontWeight: 'bold' }}>Kan zich zelfstanding verplaatsen</p>
                        <Radio.Group onChange={handleMobilityChange} value={mobility} style={{ display: 'flex', flexDirection: 'row' }}>
                            <Radio value={true}>
                                <Typography.Text>Ja</Typography.Text>
                            </Radio>
                            <Radio value={null}>
                                <Typography.Text>Maakt niet uit</Typography.Text>
                            </Radio>
                        </Radio.Group>
                    </div>
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default Search;
