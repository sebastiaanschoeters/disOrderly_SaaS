import React, {useEffect, useState} from 'react';
import {
    Avatar,
    Button,
    Divider,
    Select,
    Checkbox,
    Upload,
    ConfigProvider,
    Spin
} from 'antd';
import {
    BookOutlined,
    UploadOutlined,
    EnvironmentOutlined,
    UserOutlined,
    HeartOutlined,
    StarOutlined,
    HomeOutlined,
    CarOutlined,
    PlusCircleOutlined
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import '../CSS/AntDesignOverride.css';
import {antThemeTokens, ButterflyIcon, themes} from '../themes';
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
                const {data: interest, error} = await supabase.from('Interests').select('Interest');
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

    return { profileData, isLoading, error, interest };
};

const ProfileCard = () => {
    const [theme, setTheme] = useState('blauw');
    const themeColors = themes[theme] || themes.blauw;
    const [profilePicture, setProfilePicture] = useState('https://example.com/photo.jpg');
    const [uploading, setUploading] = useState(false);
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
    const [inputValue, setInputValue] = useState('');
    const [interests, setInterests] = useState([]);
    const [newInterest, setNewInterest] = useState('');
    const [interestOptions, setInterestOptions] = useState([])
    const [lookingForArray, setLookingForArray] = useState([])
    const [locations, setLocations] = useState([])
    const [searchValue, setSearchValue] = useState(""); // For search functionality
    const { profileData, isLoading, error, interest} = useFetchProfileData('1519');

    console.log(profileData)

    useEffect(() => {
        if (profileData.theme) {
            setTheme(profileData.theme);
        }
        if (profileData.profile_picture) {
            const imageUrlWithCacheBuster = `${profileData.profile_picture}?t=${new Date().getTime()}`;
            setProfilePicture(imageUrlWithCacheBuster);
        }
        if (profileData.locationData) {
            setLocation(profileData.locationData.gemeente);
        }
        if (profileData.gender) {
            setGender(profileData.gender);
        }
        if (profileData.interests) {
            setSelectedInterests(profileData.interests.map(interest => interest.interest_name));
        }
        if (profileData.bio) {
            setBiography(profileData.bio);
        }
        if (profileData.living_situation) {
            setLivingSituation(profileData.living_situation);
        }
        if (profileData.mobility) {
            setMobility(profileData.mobility ? 'Ja' : 'Nee');
        }
        if (interest && interest.length > 0) {
            setInterestOptions(interest.map(interest => ({ value: interest.Interest, label: interest.Interest })));
        }
        if (profileData.looking_for && Array.isArray(profileData.looking_for)) {
            setLookingForArray(profileData.looking_for);
        } else if (typeof profileData.looking_for === 'string') {
            try {
                const parsedLookingFor = JSON.parse(profileData.looking_for);
                setLookingForArray(parsedLookingFor);
            } catch (error) {
                console.error('Error parsing lookingFor:', error);
            }
        }
    }, [profileData]);

    useEffect(() => {
        const fetchLocations = async (searchTerm = "") => {
            const { data, error } = await supabase
                .from("Location")
                .select("id, Gemeente")
                .ilike("Gemeente", `%${searchTerm}%`) // Match search term
                .limit(10); // Limit results for performance

            if (error) {
                console.error("Error fetching locations:", error.message);
            } else {
                setLocations(data || []);
            }
        };

        fetchLocations(searchValue);
    }, [searchValue]);

    const handleSearch = (value) => {
        setSearchValue(value); // Trigger new fetch based on search
    };

    // Define async save functions
    const saveField = async (field, value) => {
        try {
            const { data, error } = await supabase
                .from('User information')
                .update({ [field]: value })
                .eq('user_id', profileData.id);
            if (error) throw error;

            console.log(`${field} saved successfully with value ${value}`);
        } catch (error) {
            console.error(`Error saving ${field}:`, error);
        }
    };

    // Debounced save functions
    const debouncedSaveBiography = debounce((value) => saveField('bio', value), 1000);
    const debouncedSaveLocation = debounce((value) => saveField('location', value), 1000);
    const debouncedSaveGender = debounce((value) => saveField('gender', value), 1000);
    const debouncedSaveLivingSituation = debounce((value) => saveField('living_situation', value), 1000)
    const debouncedSaveMobility = debounce((value) => saveField('mobility', value), 1000)
    const debouncedSaveLookingFor = debounce(async (updatedLookingFor) => {
        try {
            const { data, error } = await supabase
                .from('User information')
                .update({ looking_for: updatedLookingFor })
                .eq('user_id', profileData.id);
            if (error) throw error;

            console.log('Looking for updated successfully');
        } catch (error) {
            console.error('Error saving looking for:', error);
        }
    }, 1000);

    const handleLocationInputKeyDown = async (e) => {
        if (e.key === 'Enter' && inputValue) {
            const newOption = { value: inputValue, label: inputValue };
            setLocationOptions([...locationOptions, newOption]);
            setLocation(inputValue);

            // Save the new location to the database
            try {
                const { data, error } = await supabase
                    .from('Locations')
                    .insert({ location: inputValue });

                if (error) {
                    throw error;
                }

                console.log(`New location added: ${inputValue}`);
            } catch (error) {
                console.error('Error adding new location:', error);
            }

            setInputValue('');
        }
    };

    const capitalizeFirstLetter = (str) => {
        return str
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };


    const handleAddInterest = async () => {
        const capitalizedInterest = capitalizeFirstLetter(newInterest);
        if (capitalizedInterest && !interests.includes(capitalizedInterest)) {
            try {
                // Step 1: Save new interest to database
                const { data: existingInterest, error: fetchError } = await supabase
                    .from('Interests')
                    .select('id')
                    .eq('Interest', capitalizedInterest)
                    .single();

                let interestId;

                if (fetchError) {
                    // Handle fetching error or insert if interest does not exist
                    const { data: insertedInterest, error: insertError } = await supabase
                        .from('Interests')
                        .insert({ Interest: capitalizedInterest })
                        .select('id')
                        .single();

                    if (insertError) throw insertError;
                    interestId = insertedInterest.id;
                    console.log(`Inserted interest: ${insertedInterest}`);
                } else {
                    // Interest already exists, get its ID
                    interestId = existingInterest.id; // Corrected from existingInterest.interestId
                    console.log(`Existing interest: ${existingInterest}`);
                }

                // Step 2: Associate the interest with the current profile
                await supabase.from('Interested in ').insert({
                    ProfileId: profileData.id,
                    interestId: interestId
                });

                // Check if the interest is already in the options list before adding
                if (!interestOptions.some(option => option.value === capitalizedInterest)) {
                    const newInterestOption = { value: capitalizedInterest, label: capitalizedInterest };
                    setInterestOptions([...interestOptions, newInterestOption]);
                }

                // Update state to reflect new interest, ensuring it's not a duplicate
                setInterests([...interests, capitalizedInterest]);
                setSelectedInterests([...selectedInterests, capitalizedInterest]);
                setNewInterest('');
            } catch (error) {
                console.error('Error adding new interest:', error);
            }
        }
    };



    const handleInterestSelectChange = async (value) => {
        const selectedInterestNames = value;
        setSelectedInterests(selectedInterestNames);

        try {
            // Retrieve existing interests linked to this profile
            const { data: existingInterests, error: existingError } = await supabase
                .from('Interested in')
                .select('interest_id')
                .eq('user_id', profileData.id);

            if (existingError) throw existingError;

            console.log(existingInterests)

            // Create a set of existing interest IDs for efficient lookup
            const existingInterestIds = new Set(existingInterests.map((item) => item.interest_id));

            // Retrieve IDs for newly selected interests from the `Interests` table
            const { data: allInterests, error: fetchError } = await supabase
                .from('Interests')
                .select('id, Interest')
                .in('Interest', selectedInterestNames);

            if (fetchError) throw fetchError;
            console.log(allInterests)
            const newInterestIds = allInterests.map((interest) => interest.id);

            // Determine interests to add and remove
            const interestsToAdd = newInterestIds.filter((id) => !existingInterestIds.has(id));
            const interestsToRemove = Array.from(existingInterestIds).filter((id) => !newInterestIds.includes(id));

            console.log("To add", interestsToAdd.map((id) => ({ user_id: profileData.id, interest_id: id })))
            // Insert new interests if any
            if (interestsToAdd.length > 0) {
                await supabase
                    .from('Interested in')
                    .insert(interestsToAdd.map((id) => ({ user_id: profileData.id, interest_id: id })));
            }

            // Remove deselected interests if any
            if (interestsToRemove.length > 0) {
                await supabase
                    .from('Interested in')
                    .delete()
                    .eq('user_id', profileData.id)
                    .in('interest_id', interestsToRemove);
            }
        } catch (error) {
            console.error('Error updating interests:', error);
        }
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

    const handleCheckboxChange = (value) => {
        const updatedLookingFor = [...lookingForArray];
        if (updatedLookingFor.includes(value)) {
            // If the value is already in the array, remove it (unchecked)
            const index = updatedLookingFor.indexOf(value);
            updatedLookingFor.splice(index, 1);
        } else {
            // Otherwise, add it (checked)
            updatedLookingFor.push(value);
        }

        setLookingForArray(updatedLookingFor);
        debouncedSaveLookingFor(updatedLookingFor); // Save updated value to the database
    };

    const handleLivingChange = (value) => {
        setLivingSituation(value);
        debouncedSaveLivingSituation(value);
    }

    const handleMobilityChange = (value)=>{
        setMobility(value);
        debouncedSaveMobility(value);
    }

    const handleProfilePictureUpload = async ({ file }) => {
        try {
            setUploading(true);
            const fileName = `${profileData.id}-profilePicture`;

            // Check if the file already exists and remove it before upload
            const { data: existingFiles, error: listError } = await supabase.storage
                .from('profile-pictures')
                .list('', { search: profileData.id });

            if (listError) {
                console.error('Error checking existing files:', listError);
            } else {
                console.log("deleting previous instance")
                const existingFile = existingFiles.find(item => item.name.startsWith(profileData.id));
                if (existingFile) {
                    // Remove the existing file if it exists
                    const { error: deleteError } = await supabase.storage
                        .from('profile-pictures')
                        .remove([existingFile.name]);
                    if (deleteError) {
                        throw deleteError;
                    }
                }
            }

            // Upload the new file
            const { data, error: uploadError } = await supabase.storage
                .from('profile-pictures')
                .upload(fileName, file, { upsert: true }); // upsert ensures replacement if file exists
            if (uploadError) {
                throw uploadError;
            }

            console.log("data upload: ", data)

            // Get the public URL for the uploaded image
            const { data: fileData, error: urlError } = supabase.storage
                .from('profile-pictures')
                .getPublicUrl(fileName);
            if (urlError) {
                throw urlError;
            }

            console.log('file data: ', fileData)

            const imageUrl = fileData.publicUrl;
            console.log(imageUrl)

            const imageUrlWithCacheBuster = `${imageUrl}?t=${new Date().getTime()}`;
            setProfilePicture(imageUrlWithCacheBuster);


            // Save the new image URL to the user's profile
            await supabase
                .from('User')
                .update({ profile_picture: imageUrl })
                .eq('id', profileData.id);

            console.log('Profile picture uploaded successfully');
        } catch (error) {
            console.error('Error uploading profile picture:', error);
        } finally {
            setUploading(false);
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

    if (isLoading) return <Spin tip="Profiel laden..." />;
    if (error) return <p>Failed to load profile: {error}</p>;

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div style={{
                padding: '20px',
                position: 'relative',
                minWidth: '100%',
                minHeight: '100vh',
                backgroundColor: themeColors.primary2,
                color: themeColors.primary10,
                zIndex: '0'
            }}>
                <ButterflyIcon color={themeColors.primary3} />

                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <Avatar
                        src={profilePicture || "https://example.com/photo.jpg"} // Fallback to default avatar
                        alt={profileData.name || "No Name"}
                        style ={{
                            minWidth: '200px',
                            minHeight: '200px',
                            borderRadius: '50%'
                        }}
                    />
                    {/* Profile Picture Upload */}
                    <div style={{ marginTop: '10px', marginBottom: '20px' }}>
                        <Upload showUploadList={false} beforeUpload={() => false} onChange={handleProfilePictureUpload}>
                            <Button icon={<UploadOutlined />} loading={uploading}>Kies nieuwe profielfoto</Button>
                        </Upload>
                    </div>
                </div>

                <h2 style={{margin: '0', textAlign: 'center'}}>
                    {profileData.name || 'Naam'}, {calculateAge(profileData.birthdate) || 'Leeftijd'}
                </h2>

                <Divider/>

                <p style={{display: 'flex', alignItems: 'center', width: '100%', gap: '2%'}}>
                    <strong style={{width: '20%', minWidth: '150px'}}>
                        <BookOutlined/> Biografie:
                    </strong>

                    <div style={{position: 'relative', flex: 1, minWidth: '200px'}}>
                        <TextArea
                            style={{width: '100%', paddingBottom: '20px'}}
                            rows={3}
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
                        style={{flex: 1, minWidth: '200px'}}
                        placeholder="Zoek en selecteer uw locatie"
                        value={location}
                        onChange={handleLocationChange}
                        onSearch={handleSearch} // Trigger search
                        filterOption={false} // Disable client-side filtering
                        options={locations.map((location) => ({
                            value: location.id, // Use ID as the value
                            label: location.Gemeente, // Display gemeente
                        }))}
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
                            {value: 'Non-binair', label: 'Non-binair'},
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
                        notFoundContent={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span role="img" aria-label="no data" style={{ fontSize: '2rem' }}><PlusCircleOutlined/></span>
                                <span>Druk op enter om deze nieuwe interesse toe te voegen</span>
                            </div>
                        }
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
                        <Checkbox
                            checked={lookingForArray.includes('Vrienden')}
                            onChange={() => handleCheckboxChange('Vrienden')}
                        >
                            Vrienden
                        </Checkbox>
                        <Checkbox
                            checked={lookingForArray.includes('Relatie')}
                            onChange={() => handleCheckboxChange('Relatie')}
                        >
                            Relatie
                        </Checkbox>
                        <Checkbox
                            checked={lookingForArray.includes('Intieme ontmoeting')}
                            onChange={() => handleCheckboxChange('Intieme ontmoeting')}
                        >
                            Intieme ontmoeting
                        </Checkbox>
                    </div>
                </p>


                <Divider/>

                <p style={{display: 'flex', alignItems: 'center', width: '100%', gap: '2%'}}>
                    <strong style={{width: '20%', minWidth: '150px'}}><HomeOutlined/> Woonsituatie:</strong>
                    <Select
                        placeholder="Selecteer jouw woonsituatie"
                        value={livingSituation}
                        style={{flex: 1, minWidth: '200px'}}
                        onChange={handleLivingChange}
                        options={[
                            {value: 'Woont alleen', label: 'Woont alleen'},
                            {value: 'Begeleid wonen', label: 'Begeleid wonen'},
                            {value: 'Woont in bij ouders', label: 'Woont in bij ouders'},
                            {value: 'Woont in groepsverband', label: 'Woont in groepsverband'},
                            {value: 'Woont in zorginstelling', label: 'Woont in zorginstelling'},
                        ]}
                    />
                </p>

                <Divider/>

                <p style={{display: 'flex', alignItems: 'center', width: '100%', gap: '2%'}}>
                    <strong style={{width: '20%', minWidth: '150px'}}><CarOutlined/> Kan zich zelfstanding verplaatsen:</strong>
                    <Select
                        value={mobility}
                        style={{flex: 1, minWidth: '200px'}}
                        onChange={handleMobilityChange}
                        options={[
                            {value: 'True', label: 'Ja'},
                            {value: 'False', label: 'Nee'},
                        ]}
                    />
                </p>
            </div>
        </ConfigProvider>
    );
};

export default ProfileCard;