import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Tag,
    Avatar,
    Button,
    Divider,
    Select,
    Checkbox,
    Upload,
    ConfigProvider, Spin
} from 'antd';
import {
    BookOutlined,
    CloseOutlined,
    SaveOutlined,
    UploadOutlined,
    EnvironmentOutlined,
    UserOutlined,
    HeartOutlined,
    StarOutlined,
    HomeOutlined,
    CarOutlined
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import '../CSS/AntDesignOverride.css';
import { antThemeTokens, themes } from '../themes';
import TextArea from "antd/es/input/TextArea";
import {createClient} from "@supabase/supabase-js";

const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q")

// Debounce utility function
const debounce = (func, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
};

const useFetchProfileData = (actCode) => {
    const [profileData, setProfileData] = useState({});
    const [interest, setInterests] = useState([])
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(()=> {
        const fetchInterests = async () => {
            try{
                const {data: interest, error} = await supabase.from('Interests').select('interest');
                if (error) throw error;
                setInterests(interest)
            } catch (error) {
                console.error('Error fetching interests:', error);
            }
        };
        fetchInterests();
    }, []);

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
                    console.log("profile data: ", profileData)
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [actCode]);

    return { profileData, isLoading, error, interest };
};

const ProfileCard = () => {
    const [theme, setTheme] = useState('blauw');
    const themeColors = themes[theme] || themes.blauw;
    const [profilePicture, setProfilePicture] = useState('https://example.com/photo.jpg');
    const [location, setLocation] = useState(null);
    const [locationOptions, setLocationOptions] = useState([
        { value: 'Leuven', label: 'Leuven' },
        { value: 'Brussel', label: 'Brussel' },
        { value: 'Gent', label: 'Gent' },
        { value: 'Antwerpen', label: 'Antwerpen' },
    ]);
    const [gender, setGender] = useState('')
    const [biography, setBiography] = useState('');
    const [livingSituation, setLivingSituation] = useState('');
    const [mobility, setMobility]= useState('')
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [images, setImages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [interests, setInterests] = useState([]);
    const [newInterest, setNewInterest] = useState('');
    const [interestOptions, setInterestOptions] = useState([])
    const navigate = useNavigate();
    const { profileData, isLoading, error, interest} = useFetchProfileData('1547');

    useEffect(() => {
        if (profileData.theme){
            setTheme(profileData.theme);
        }
        if (profileData.picture){
            setProfilePicture(profileData.picture)
        }
        if (profileData.location) {
            setLocation(profileData.location);
        }
        if (profileData.gender) {
            setGender(profileData.gender)
        }
        if (profileData.interests) {
            setSelectedInterests(profileData.interests.map(interest => interest.interest_name));
        }
        if (profileData.bio) {
            setBiography(profileData.bio);
        }
        if (profileData.livingSituation){
            setLivingSituation(profileData.livingSituation)
        }
        if (profileData.hasOwnProperty('mobility')) {
            setMobility(profileData.mobility ? 'ja' : 'nee');
        }
        if (interest && interest.length > 0) {
            setInterestOptions(interest.map(interest => ({ value: interest.interest, label: interest.interest })));
        }

        console.log("Interest options: ",interest)
    }, [profileData]);

    // Define async save functions
    const saveField = async (field, value) => {
        try {
            const { error } = await supabase
                .from('Profile')
                .update({ [field]: value })
                .eq('ActCode', profileData.ActCode);
            if (error) throw error;
            console.log(`${field} saved successfully`);
        } catch (error) {
            console.error(`Error saving ${field}:`, error);
        }
    };

    // Debounced save functions
    const debouncedSaveBiography = debounce((value) => saveField('bio', value), 1000);
    const debouncedSaveLocation = debounce((value) => saveField('location', value), 1000);
    const debouncedSaveGender = debounce((value) => saveField('gender', value), 1000);
    const debouncedSaveLivingSituation = debounce((value) => saveField('livingSituation', value), 1000)
    const debouncedSaveMobility = debounce((value) => saveField('mobility', value), 1000)

    const handleLocationInputKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue) {
            const newOption = { value: inputValue, label: inputValue };
            setLocationOptions([...locationOptions, newOption]);
            setLocation(inputValue);
            setInputValue('');
        }
    };

    const handleAddInterest = () => {
        if (newInterest && !interests.includes(newInterest)) {
            setInterests([...interests, newInterest]);
            setNewInterest('');
        }
    };

    const handleInterestSelectChange = (value) => {
        setSelectedInterests(value);
    };

    const handleBiographyChange = (e) => {
        const newValue = e.target.value;
        setBiography(newValue);
        debouncedSaveBiography(newValue);
    };

    const handleLocationChange = (value) => {
        setLocation(value);
        debouncedSaveLocation(value);
    };

    const handleGenderChange = (value) => {
        setGender(value);
        debouncedSaveGender(value);
    };

    const handleLivingChange = (value) => {
        setLivingSituation(value);
        debouncedSaveLivingSituation(value);
    }

    const handleMobilityChange = (value)=>{
        setMobility(value);
        debouncedSaveMobility(value);
    }

    const handleProfilePictureChange = ({ file }) => {
        if (file.status === 'done') {
            const imageUrl = URL.createObjectURL(file.originFileObj);
            setProfilePicture(imageUrl);
        }
    };

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
            <div style={{
                padding: '20px',
                position: 'relative',
                width: '100%',
                height: '100vh',
                backgroundColor: themeColors.primary2,
                color: themeColors.primary10
            }}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    {images.length > 0 ? (
                        images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Uploaded ${index}`}
                                style={{width: '100px', height: '100px', objectFit: 'cover', margin: '5px'}}
                            />
                        ))
                    ) : (
                        <Avatar
                            src={profileData.picture || "https://example.com/photo.jpg"} // Fallback to default avatar
                            alt={profileData.name || "No Name"}
                            size={100}
                            style={{margin: '20px auto', display: 'block'}}
                        />
                    )}
                    {/* Profile Picture Upload */}
                    <div style={{marginTop: '10px', marginBottom: '20px'}}>
                        <Upload showUploadList={false} onChange={handleProfilePictureChange}>
                            <Button icon={<UploadOutlined/>}>Kies nieuwe profiel foto</Button>
                        </Upload>
                    </div>
                </div>

                <h2 style={{margin: '0', textAlign: 'center'}}>
                    {profileData.name || 'Naam'}, {calculateAge(profileData.birthDate) || 'Leeftijd'}
                </h2>

                <Divider/>

                <p style={{display: 'flex', alignItems: 'center', width: '100%', gap: '2%'}}>
                    <strong style={{width: '20%', minWidth: '150px' }}>
                        <BookOutlined /> Biografie:
                    </strong>

                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <TextArea
                            style={{ width: '100%', paddingBottom: '20px' }}
                            rows={4}
                            placeholder="Vertel iets over jezelf"
                            value={biography}
                            onChange={handleBiographyChange}
                            maxLength={200}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '5px',
                                right: '10px',
                                fontSize: '12px',
                                background: 'transparent',
                            }}
                        >
                            {biography.length}/200
                        </div>
                    </div>
                </p>

                <Divider/>

                <p style={{display: 'flex', alignItems: 'center', width: '100%', gap: '2%'}}>
                    <strong style={{width: '20%', minWidth: '150px'}}><EnvironmentOutlined/> Locatie: </strong>
                    <Select
                        showSearch
                        allowClear
                        placeholder="Selecteer locatie of voeg toe"
                        style={{flex: 1, minWidth: '200px'}}
                        value={location}
                        onChange={handleLocationChange}
                        options={locationOptions}
                        onSearch={(value) => setInputValue(value)}
                        onInputKeyDown={handleLocationInputKeyDown}
                    />
                </p>

                <Divider/>

                <p style={{display: 'flex', alignItems: 'center', width: '100%', gap: '2%'}}>
                    <strong style={{width: '20%', minWidth: '150px'}}><UserOutlined/> Geslacht: </strong>
                    <Select
                        style={{flex: 1, minWidth: '200px'}}
                        placeholder="Selecteer geslacht"
                        value={gender}
                        onChange={handleGenderChange}
                        options={[
                            {value: 'Man', label: 'Man'},
                            {value: 'Vrouw', label: 'Vrouw'},
                            {value: 'Non-binary', label: 'Non-binair'},
                        ]}
                    />
                </p>

                <Divider/>

                <p style={{display: 'flex', alignItems: 'center', width: '100%', gap: '2%'}}>
                    <strong style={{width: '20%', minWidth: '150px'}}><StarOutlined/> Interesses:</strong>
                    <Select
                        mode="multiple"
                        allowClear
                        placeholder="Selecteer interesses of voeg toe"
                        style={{flex: 1, minWidth: '200px'}}
                        options={interestOptions}
                        value={selectedInterests}
                        onChange={handleInterestSelectChange}
                        onSearch={(value) => setNewInterest(value)}
                        onInputKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleAddInterest();
                            }
                        }}
                    />
                </p>

                <Divider/>

                <p style={{display: 'flex', alignItems: 'center', width: '100%', gap: '2%'}}>
                    <strong style={{width: '20%', minWidth: '150px'}}><HeartOutlined/> Is op zoek naar:</strong>
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        minWidth: '200px'
                    }}>
                        <Checkbox checked={lookingForArray.includes('vrienden')}>Vrienden</Checkbox>
                        <Checkbox checked={lookingForArray.includes('relatie')}>Relatie</Checkbox>
                        <Checkbox checked={lookingForArray.includes('Intieme ontmoeting')}>Intieme ontmoeting</Checkbox>
                    </div>
                </p>

                <Divider/>

                <p style={{display: 'flex', alignItems: 'center', width: '100%', gap: '2%'}}>
                    <strong style={{width: '20%', minWidth: '150px'}}><HomeOutlined/> Woonsituatie:</strong>
                    <Select
                        placeholder="Selecteer jouw woonsituatie"
                        value = {livingSituation}
                        style={{flex: 1, minWidth: '200px'}}
                        onChange = {handleLivingChange}
                        options={[
                            {value: 'Alone', label: 'Woont alleen'},
                            {value: 'Guided', label: 'Begeleid wonen'},
                            {value: 'Parents', label: 'Bij ouders'},
                            {value: 'group', label: 'In groepsverband'},
                            {value: 'instance', label: 'zorginstelling'},
                        ]}
                    />
                </p>

                <Divider/>

                <p style={{display: 'flex', alignItems: 'center', width: '100%', gap: '2%'}}>
                    <strong style={{width: '20%', minWidth: '150px'}}><CarOutlined/> Kan zich zelfstanding verplaatsen:</strong>
                    <Select
                        value = {mobility}
                        style={{flex: 1, minWidth: '200px'}}
                        onChange={handleMobilityChange}
                        options={[
                            {value: 'True', label: 'ja'},
                            {value: 'False', label: 'nee'},
                        ]}
                    />
                </p>

                <Button
                    type="primary"
                    icon={<SaveOutlined/>}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 1000
                    }}
                >
                    Veranderingen opslaan
                </Button>
            </div>
        </ConfigProvider>
    );
};

export default ProfileCard;