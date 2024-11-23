import React, {useEffect, useState} from 'react';
import {Avatar, Button, Carousel, Checkbox, ConfigProvider, Divider, message, Select, Spin, Upload} from 'antd';
import {
    BookOutlined,
    CarOutlined,
    DeleteOutlined,
    EnvironmentOutlined,
    HeartOutlined,
    HomeOutlined,
    LeftOutlined,
    PictureOutlined,
    PlusCircleOutlined,
    RightOutlined,
    StarOutlined,
    UploadOutlined,
    UserOutlined
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import '../CSS/AntDesignOverride.css';
import '../CSS/EditableProfilePage.css';
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
                    .select('id, name, birthdate, profile_picture')
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

const ProfileCard = () => {
    const [theme, setTheme] = useState('blauw');
    const themeColors = themes[theme] || themes.blauw;
    const [profilePicture, setProfilePicture] = useState('https://example.com/photo.jpg');
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState([
        'https://i.pravatar.cc/150?img=1',
        'https://i.pravatar.cc/150?img=2',
        'https://i.pravatar.cc/150?img=3',
        'https://i.pravatar.cc/150?img=4'
    ]);
    const [uploadingPicture, setUploadingPicture] = useState(false);
    const [removingPicture, setRemovingPicture] = useState(false);
    const [location, setLocation] = useState(null);
    const [gender, setGender] = useState('')
    const [biography, setBiography] = useState('');
    const [livingSituation, setLivingSituation] = useState('');
    const [mobility, setMobility]= useState('')
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [interests, setInterests] = useState([]);
    const [newInterest, setNewInterest] = useState('');
    const [interestOptions, setInterestOptions] = useState([])
    const [lookingForArray, setLookingForArray] = useState([])
    const [locations, setLocations] = useState([])
    const [searchValue, setSearchValue] = useState(""); // For search functionality
    const { pictures} = useFetchPicturesData(localStorage.getItem('user_id'));
    const { profileData, isLoading, error, interest} = useFetchProfileData(localStorage.getItem('user_id'));

    const applyThemeToCSS = (themeColors) => {
        const root = document.documentElement;
        Object.entries(themeColors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
    };

    useEffect(() => {
        applyThemeToCSS(themeColors); // Apply the selected theme
    }, [themeColors]);

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
        let list_of_images = [];
        if (pictures.length > 0) {
            for (let i = 0; i < pictures.length; i++) {
                const picture = pictures[i];
                if (picture.picture_url) {
                    list_of_images.push(picture.picture_url);
                }
            }
        }
        setImages(list_of_images);
        console.log(list_of_images)
    }, [pictures]);

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

    const [slidesToShow, setSlidesToShow] = useState(calculateSlidesToShow(images.length+1))

    useEffect(() => {
        const handleResize = () => {
            setSlidesToShow(calculateSlidesToShow(images.length+1));
        };

        window.addEventListener('resize', handleResize);

        // Cleanup on unmount
        return () => window.removeEventListener('resize', handleResize);
    }, [images.length]);

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

            console.log(`Looking for updated successfully width value ${updatedLookingFor}`);
        } catch (error) {
            console.error('Error saving looking for:', error);
        }
    }, 1000);


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
                } else {
                    // Interest already exists, get its ID
                    interestId = existingInterest.id;
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

            // Create a set of existing interest IDs for efficient lookup
            const existingInterestIds = new Set(existingInterests.map((item) => item.interest_id));

            // Retrieve IDs for newly selected interests from the `Interests` table
            const { data: allInterests, error: fetchError } = await supabase
                .from('Interests')
                .select('id, Interest')
                .in('Interest', selectedInterestNames);

            if (fetchError) throw fetchError;
            const newInterestIds = allInterests.map((interest) => interest.id);

            // Determine interests to add and remove
            const interestsToAdd = newInterestIds.filter((id) => !existingInterestIds.has(id));
            const interestsToRemove = Array.from(existingInterestIds).filter((id) => !newInterestIds.includes(id));

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

    const handlePictureUpload = async ({ file }) => {
        try {
            setUploadingPicture(true);

            const cropImage = (file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const img = new Image();
                        img.onload = () => {
                            const maxAspectRatio = 1.7;
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');

                            let { width, height } = img;
                            const aspectRatio = width / height;

                            if (aspectRatio > maxAspectRatio) {
                                // Crop width to match the max aspect ratio
                                width = height * maxAspectRatio;
                            }

                            canvas.width = width;
                            canvas.height = height;

                            // Draw the cropped image
                            ctx.drawImage(
                                img,
                                (img.width - width) / 2, // Center the cropped area horizontally
                                0, // Start at the top
                                width,
                                height,
                                0,
                                0,
                                canvas.width,
                                canvas.height
                            );

                            canvas.toBlob(
                                (blob) => {
                                    if (blob) {
                                        resolve(new File([blob], file.name, { type: file.type }));
                                    } else {
                                        reject('Failed to crop the image.');
                                    }
                                },
                                file.type,
                                1 // Quality (1 = max)
                            );
                        };
                        img.onerror = () => reject("Invalid image file.");
                        img.src = reader.result;
                    };
                    reader.onerror = () => reject("Error reading file.");
                    reader.readAsDataURL(file);
                });
            };

            // Crop the image before uploading
            const croppedFile = await cropImage(file);

            // Proceed with upload
            const uniqueSuffix = `${new Date().getTime()}-${Math.random().toString(36).substring(2, 9)}`;
            const fileName = `${profileData.id}-${uniqueSuffix}-${croppedFile.name}`;

            const { data, error: uploadError } = await supabase.storage
                .from('extra-pictures')
                .upload(fileName, croppedFile, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: fileData, error: urlError } = supabase.storage
                .from('extra-pictures')
                .getPublicUrl(fileName);

            if (urlError) throw urlError;

            const imageUrl = fileData.publicUrl;
            const imageUrlWithCacheBuster = `${imageUrl}?t=${new Date().getTime()}`;

            const { error: dbInsertError } = await supabase
                .from('Pictures')
                .insert({ User_id: profileData.id, picture_url: imageUrl });

            if (dbInsertError) throw dbInsertError;

            setImages([...images, imageUrlWithCacheBuster])

        } catch (error) {
            message.error(error.message);
        } finally {
            setUploadingPicture(false);
        }
    };



    const handlePictureRemove = async (imageUrlToRemove) => {
        try {
            setRemovingPicture(true);

            const fileName = imageUrlToRemove.split('/').pop().split('?')[0];

            const { error: storageDeleteError } = await supabase
                .storage
                .from('extra-pictures')
                .remove([fileName]);

            if (storageDeleteError) {
                throw storageDeleteError;
            }

            const { error: dbDeleteError } = await supabase
                .from('Pictures')
                .delete()
                .eq('picture_url', imageUrlToRemove);

            if (dbDeleteError) {
                console.error("DB Delete Error:", dbDeleteError)
                throw dbDeleteError;
            }

            console.log("removed picture:", imageUrlToRemove)

            setImages((prevImages) => {
                return prevImages.filter((url) => url !== imageUrlToRemove);
            });
        } catch (error) {
            console.error('Error removing profile picture:', error);
        } finally {
            setRemovingPicture(false);
        }
    };

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

            const { data: fileData, error: urlError } = supabase.storage
                .from('profile-pictures')
                .getPublicUrl(fileName);
            if (urlError) {
                throw urlError;
            }

            const imageUrl = fileData.publicUrl;

            const imageUrlWithCacheBuster = `${imageUrl}?t=${new Date().getTime()}`;
            setProfilePicture(imageUrlWithCacheBuster);


            // Save the new image URL to the user's profile
            await supabase
                .from('User')
                .update({ profile_picture: imageUrl })
                .eq('id', profileData.id);

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

    if (isLoading) return <Spin tip="Profiel laden..." />;
    if (error) return <p>Failed to load profile: {error}</p>;

    return (
        <ConfigProvider theme={{token: antThemeTokens(themeColors)}}>
            <div style={{
                padding: '20px',
                position: 'relative',
                minWidth: '100vw',
                minHeight: '100vh',
                overflow: 'hidden',
                backgroundColor: themeColors.primary2,
                color: themeColors.primary10,
                zIndex: '0'
            }}>
                <ButterflyIcon color={themeColors.primary3}/>

                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '20px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px'}}>
                        <Avatar
                            src={profilePicture}
                            alt={profileData.name}
                            style={{
                                minWidth: '200px',
                                minHeight: '200px',
                                borderRadius: '50%'
                            }}
                        />
                        <div>
                            <h2 style={{margin: '0', textAlign: 'center'}}>
                                {profileData.name || 'Naam'}, {calculateAge(profileData.birthdate) || 'Leeftijd'}
                            </h2>
                            <div style={{marginTop: '10px', marginBottom: '20px'}}>
                                <Upload showUploadList={false} beforeUpload={() => false}
                                        onChange={handleProfilePictureUpload}>
                                    <Button icon={<UploadOutlined/>} loading={uploading}>Kies nieuwe
                                        profielfoto</Button>
                                </Upload>
                            </div>
                        </div>
                    </div>
                </div>

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
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <span role="img" aria-label="no data"
                                      style={{fontSize: '2rem'}}><PlusCircleOutlined/></span>
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
                            {value: 'Andere', label: 'Andere'},
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

                <Divider/>

                <div style={{marginTop: '20px', marginBottom: '20px'}}>
                    <p>
                        <strong style={{width: '40%', minWidth: '150px', flexShrink: 0}}>
                            <PictureOutlined/> Meer fotos van jezelf tonen:
                        </strong>
                    </p>
                    <Carousel
                        prevArrow={<CustomPrevArrow />}
                        nextArrow={<CustomNextArrow />}
                        arrows
                        slidesToShow={slidesToShow}
                        draggable
                        infinite={false}
                        style={{
                            maxWidth: '80%',
                            height: '200px',
                            margin: '0 auto'
                        }}
                    >
                        <Upload showUploadList={false} beforeUpload={() => false} onChange={handlePictureUpload}
                                multiple>
                            <Button icon={<UploadOutlined/>} loading={uploadingPicture} style={{
                                position: 'relative',
                                height: '200px',
                            }}>
                                Voeg nieuwe foto toe aan profiel
                            </Button>
                        </Upload>

                        {images.map((imageUrl, index) => (
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
                                        height: '200px',
                                        width: 'auto',
                                        objectFit: 'cover',
                                        borderRadius: '10px',
                                        margin: '0 auto'
                                    }}
                                />
                                {images[index] && (
                                    <Button
                                        type="text"
                                        onClick={() => handlePictureRemove(imageUrl)}
                                        style={{
                                            height: '200px',
                                            width: '200px',
                                            position: 'relative',
                                            top: `-100px`,
                                            left: `50%`,
                                            transform: 'translate(-50%, -50%)',
                                            zIndex: 10,
                                            padding: '0',
                                            cursor: 'pointer',
                                            fontSize: '96px',
                                        }}
                                        className='delete-button'
                                        loading={removingPicture}
                                    >
                                        <DeleteOutlined/>
                                    </Button>
                                )}
                            </div>
                        ))}
                    </Carousel>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default ProfileCard;