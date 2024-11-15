import 'antd/dist/reset.css'; // Import Ant Design styles
import '../CSS/AntDesignOverride.css';
import { antThemeTokens, themes } from '../themes';
import { Avatar, Button, Card, ConfigProvider, Input, List, Typography, Modal, Slider, Radio, Checkbox } from 'antd'; // Added Checkbox import
import { CloseOutlined, FilterOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { createClient } from "@supabase/supabase-js";

const Search = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('blauw');
    const themeColors = themes[theme] || themes.blauw;
    const [searchQuery, setSearchQuery] = useState('');
    const [ageRange, setAgeRange] = useState([18, 100]);  // State for age range selection
    const [gender, setGender] = useState('');  // State for gender filter (single value)
    const [lookingFor, setLookingFor] = useState([]);  // State for lookingFor filter (array)
    const [mobility, setMobility] = useState(null);  // State for mobility filter
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { Title } = Typography;
    const supabase = createClient(
        "https://flsogkmerliczcysodjt.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q"
    );

    const [users, setUsers] = useState([]);

    // Function to calculate age from birthdate
    const calculateAge = (birthDate) => {
        const birthDateObj = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const month = today.getMonth();
        const day = today.getDate();

        // Adjust if the birthday hasn't occurred yet this year
        if (month < birthDateObj.getMonth() || (month === birthDateObj.getMonth() && day < birthDateObj.getDate())) {
            age--;
        }

        return age;
    };

    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase
                .from('Profile')
                .select('ActCode, name, birthDate, gender, lookingFor, mobility');  // Select mobility field as well

            if (error) {
                console.error('Error fetching users:', error);
            } else {
                const usersWithAge = data.map(user => {
                    const age = calculateAge(user.birthDate);
                    return { ...user, age };
                });
                setUsers(usersWithAge);
            }
        };

        fetchUsers();
    }, []);

    // Filter users by name, age, gender, lookingFor, and mobility
    const filteredUsers = users.filter((Users) => {
        const isInAgeRange = Users.age >= ageRange[0] && Users.age <= ageRange[1];
        const isGenderMatch = gender ? Users.gender === gender : true;
        const isLookingForMatch = lookingFor.length > 0 ? lookingFor.every(option => Users.lookingFor.includes(option)) : true;  // Match all selected options
        const isMobilityMatch = mobility !== null ? Users.mobility === mobility : true;  // Add mobility filter check

        return (
            Users.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            isInAgeRange &&
            isGenderMatch &&
            isLookingForMatch &&
            isMobilityMatch
        );
    });

    const handleSearch = (value) => {
        setSearchQuery(value);
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    const handleAgeChange = (value) => {
        setAgeRange(value);
    };

    const handleGenderChange = (e) => {
        setGender(e.target.value);
    };

    const handleLookingForChange = (checkedValues) => {
        setLookingFor(checkedValues);
    };

    const handleMobilityChange = (e) => {
        setMobility(e.target.value); // Update mobility to either true, false, or null (for "All")
    };

    const styles = {
        chatContainer: {
            padding: '20px',
            width: '100%',
            height: '100vh',
            backgroundColor: themeColors.primary2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflowY: 'auto',
        },
        titleButton: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '0px 20px'
        },
        title: {
            flexGrow: 1,
            textAlign: 'center',
            margin: 0,
        },
        button: {
            backgroundColor: themeColors.primary8,
        },
        searchBarContainer: {
            width: '75%',
            display: 'flex',
            marginBottom: '20px',
            marginTop: '20px',
        },
        searchBar: {
            flex: 1,
        },
        list: {
            width: '75%',
        },
        card: {
            width: '100%',
            height: '75px',
            marginBottom: '10px',
            borderRadius: '10px',
            borderWidth: '1px',
            borderColor: themeColors.primary7,
            cursor: 'pointer',
        },
        name: {
            fontSize: '14px',
        },
        modalContent: {
            padding: '20px',
        },
    };

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div style={styles.chatContainer}>
                <div style={styles.titleButton}>
                    <Title level={2} style={styles.title}>Gebruikers</Title>
                </div>

                <div style={styles.searchBarContainer}>
                    <Input.Search
                        placeholder="Zoek gebruikers..."
                        style={styles.searchBar}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onSearch={handleSearch}
                        allowClear
                    />
                    <Button
                        type="text"
                        icon={<FilterOutlined />}
                        onClick={showModal}
                    />
                </div>

                <List
                    itemLayout="horizontal"
                    style={styles.list}
                    dataSource={filteredUsers}
                    renderItem={(chat) => (
                        <Card
                            style={styles.card}
                            hoverable={true}
                            onClick={() => {
                                navigate('/profile');
                            }}
                        >
                            <Card.Meta
                                avatar={<Avatar>U</Avatar>}
                                title={<span style={styles.name}>{chat.name}</span>}
                            />
                        </Card>
                    )}
                />

                {/* Modal with Age, Gender, LookingFor, and Mobility Filters */}
                <Modal
                    title="Ik zoek iemand die ..."
                    visible={isModalVisible}
                    onCancel={handleModalClose}
                    footer={null}
                >
                    <div style={styles.modalContent}>
                        <Typography.Text>Leeftijd: {ageRange[0]} - {ageRange[1]} jaar</Typography.Text>
                        <Slider
                            range
                            min={18}
                            max={100}
                            defaultValue={ageRange}
                            onChange={handleAgeChange}
                        />
                        <div style={{marginTop: '20px'}}>
                            <Typography.Text>Ik zoek een:</Typography.Text>
                            <Radio.Group
                                onChange={handleGenderChange}
                                value={gender}
                                style={{marginLeft: '10px', display: 'flex', gap: '10px'}}
                            >
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

                        <div style={{marginTop: '20px'}}>
                            <Typography.Text>Ik ben opzoek naar:</Typography.Text>
                            <Checkbox.Group
                                onChange={handleLookingForChange}
                                value={lookingFor}
                            >
                                <Checkbox value="Vrienden">Vrienden</Checkbox>
                                <Checkbox value="Relatie">Relatie</Checkbox>
                                <Checkbox value="Intieme ontmoeting">Intieme ontmoeting</Checkbox>
                            </Checkbox.Group>
                        </div>
                        <div style={{marginTop: '20px'}}>
                            <Typography.Text>Mobility:</Typography.Text>
                            <Radio.Group
                                onChange={handleMobilityChange}
                                value={mobility}
                                style={{
                                    marginLeft: '10px',
                                    display: 'flex',
                                    gap: '10px'
                                }}  // Added styles for horizontal alignment
                            >
                                <Radio value={true}>
                                    <Typography.Text>Ja</Typography.Text>
                                </Radio>
                                <Radio value={null}>
                                    <Typography.Text>Maakt niet uit</Typography.Text>
                                </Radio>
                            </Radio.Group>
                        </div>


                    </div>
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default Search;
