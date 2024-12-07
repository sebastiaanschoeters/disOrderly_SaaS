import React, {useEffect, useState} from 'react';
import {Avatar, Button, Carousel, Checkbox, ConfigProvider, Divider, message, Select, Spin, Upload} from 'antd';
import { BookOutlined, CarOutlined, DeleteOutlined, EnvironmentOutlined, HeartOutlined, HomeOutlined, LeftOutlined, PictureOutlined, PlusCircleOutlined, RightOutlined, StarOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import {antThemeTokens, ButterflyIcon, themes} from '../../Extra components/themes';
import TextArea from "antd/es/input/TextArea";
import {createClient} from "@supabase/supabase-js";
import 'antd/dist/reset.css';
import '../../CSS/AntDesignOverride.css';
import '../../CSS/EditableProfilePage.css';
import HomeButtonUser from "../../Extra components/HomeButtonUser";
import useFetchProfileData from "../../UseHooks/useFetchProfileData";
import {calculateAge, calculateSlidesToShow} from "../../Utils/calculations";
import useLocations from "../../UseHooks/useLocations";
import {debounce, saveField} from "../../Api/Utils";
import useThemeOnCSS from "../../UseHooks/useThemeOnCSS";
import {uploadProfilePicture} from "../../Utils/uploadProfilePicture";

const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q")

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
    const user_id = localStorage.getItem('user_id')
    let [savedTheme, savedDarkMode] = JSON.parse(localStorage.getItem('theme'));
    let theme
    if (savedDarkMode) {
        theme = savedDarkMode + "_donker";
    } else {
        theme = savedTheme;
    }
    const themeColors = themes[theme] || themes.blauw;
    const name = localStorage.getItem('name')

    const savedProfilePicture = localStorage.getItem('profile_picture')
    const [profilePicture, setProfilePicture] = useState(savedProfilePicture);
    const [uploading, setUploading] = useState(false);

    const [images, setImages] = useState([
        'https://i.pravatar.cc/150?img=1',
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
    const [searchValue, setSearchValue] = useState(""); // For search functionality

    const { pictures} = useFetchPicturesData(user_id);
    const { profileData, isLoading, error, interest} = useFetchProfileData(user_id, { fetchAllInterests: true});

    useThemeOnCSS(themeColors);

    useEffect(() => {
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
    }, [pictures]);

    const [slidesToShow, setSlidesToShow] = useState(calculateSlidesToShow(images.length+1))

    useEffect(() => {
        const handleResize = () => {
            setSlidesToShow(calculateSlidesToShow(images.length+1));
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        // Cleanup on unmount
        return () => window.removeEventListener('resize', handleResize);
    }, [images.length]);

    const { locations } = useLocations(searchValue);

    const handleSearch = (value) => {
        setSearchValue(value); // Trigger new fetch based on search
    };

    // Debounced save functions
    const debouncedSaveBiography = debounce((value) => saveField(user_id, 'bio', value), 1000);
    const debouncedSaveLocation = debounce((value) => saveField(user_id, 'location', value), 1000);
    const debouncedSaveGender = debounce((value) => saveField(user_id, 'gender', value), 1000);
    const debouncedSaveLivingSituation = debounce((value) => saveField(user_id, 'living_situation', value), 1000)
    const debouncedSaveMobility = debounce((value) => saveField(user_id, 'mobility', value), 1000)
    const debouncedSaveLookingFor = debounce(async (updatedLookingFor) => {
        try {
            const { data, error } = await supabase
                .from('User information')
                .update({ looking_for: updatedLookingFor })
                .eq('user_id', user_id);
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
                    ProfileId: user_id,
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
                .eq('user_id', user_id);

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
                    .insert(interestsToAdd.map((id) => ({ user_id: user_id, interest_id: id })));
            }

            // Remove deselected interests if any
            if (interestsToRemove.length > 0) {
                await supabase
                    .from('Interested in')
                    .delete()
                    .eq('user_id', user_id)
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
            const fileName = `${user_id}-${uniqueSuffix}-${croppedFile.name}`;

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
                .insert({ User_id: user_id, picture_url: imageUrl });

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

            const imageUrlWithCacheBuster = await uploadProfilePicture(user_id, file, 'profile-pictures');

            setProfilePicture(imageUrlWithCacheBuster);
            localStorage.setItem('profile_picture', imageUrlWithCacheBuster);

            await supabase
                .from('User')
                .update({ profile_picture: imageUrlWithCacheBuster })
                .eq('id', user_id);

        } catch (error) {
            console.error('Error uploading profile picture:', error);
        } finally {
            setUploading(false);
        }
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
                minWidth: '100dvw',
                minHeight: '100vh',
                overflow: 'hidden',
                backgroundColor: themeColors.primary2,
                color: themeColors.primary10,
                zIndex: '0'
            }}>
                <HomeButtonUser color={themeColors.primary7} />
                <ButterflyIcon color={themeColors.primary3}/>

                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '20px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px'}}>
                        <Avatar
                            src={profilePicture}
                            alt={name}
                            style={{
                                minWidth: '150px',
                                width: '10dvw',
                                minHeight: '150px',
                                height: '10dvw',
                                borderRadius: '50%'
                            }}
                        >
                            <h2>{name[0]}</h2>
                        </Avatar>
                        <div>
                            <h2 style={{margin: '0', textAlign: 'center'}}>
                                {name || 'Naam'}, {calculateAge(profileData.birthdate) || 'Leeftijd'}
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
                        notFoundContent={
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <span role="img" aria-label="no data"
                                      style={{fontSize: '2rem'}}><EnvironmentOutlined/></span>
                                <span>Locatie niet gevonden</span>
                            </div>
                        }
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
                                Voeg foto toe aan profiel
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