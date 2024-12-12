import React, {useEffect, useRef, useState} from 'react';
import {
    Avatar,
    Button,
    Carousel,
    Checkbox,
    ConfigProvider,
    Divider,
    message,
    Select,
    Spin,
    Typography,
    Upload
} from 'antd';
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
import {saveField} from "../../Api/Utils";
import useThemeOnCSS from "../../UseHooks/useThemeOnCSS";
import {requests} from "../../Utils/requests";
import useTheme from "../../UseHooks/useTheme";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const useFetchPicturesData = (actCode) => {
    const [pictures, setPictures] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: pictures, error: userError } = await supabase
                    .from('Pictures')
                    .select('*')
                    .eq('User_id', actCode);

                if (userError) throw userError;
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
    const carouselRef = useRef(null);
    const user_id = localStorage.getItem('user_id')
    let [savedTheme, savedDarkMode] = JSON.parse(localStorage.getItem('theme'));

    const { themeColors, setThemeName, setDarkModeFlag } = useTheme(savedTheme, savedDarkMode)

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
    const [searchValue, setSearchValue] = useState("");

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

        return () => window.removeEventListener('resize', handleResize);
    }, [images.length]);

    const { locations } = useLocations(searchValue);

    const handleSearch = (value) => {
        setSearchValue(value);
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
                const { data: existingInterest, error: fetchError } = await supabase
                    .from('Interests')
                    .select('id')
                    .eq('Interest', capitalizedInterest)
                    .single();

                let interestId;

                if (fetchError) {
                    const { data: insertedInterest, error: insertError } = await supabase
                        .from('Interests')
                        .insert({ Interest: capitalizedInterest })
                        .select('id')
                        .single();

                    if (insertError) throw insertError;
                    interestId = insertedInterest.id;
                } else {
                    interestId = existingInterest.id;
                }

                await supabase.from('Interested in').insert({
                    user_id: user_id,
                    interest_id: interestId
                });
                if (!interestOptions.some(option => option.value === capitalizedInterest)) {
                    const newInterestOption = { value: capitalizedInterest, label: capitalizedInterest };
                    setInterestOptions([...interestOptions, newInterestOption]);
                }

                setInterests([...interests, capitalizedInterest]);
                setSelectedInterests([...selectedInterests, capitalizedInterest]);
                setNewInterest('');
                message.success({content: "nieuwe interesse opgeslagen", style: {fontSize:'30px'}})
            } catch (error) {
                console.error('Error adding new interest:', error);
                message.error({content: "probleem bij het toevoegen van een nieuwe interesse", style:{fontSize:'20px'}})
            }
        }
    };

    const handleInterestSelectChange = async (value) => {
        const selectedInterestNames = value;
        setSelectedInterests(selectedInterestNames);

        try {
            const { data: existingInterests, error: existingError } = await supabase
                .from('Interested in')
                .select('interest_id')
                .eq('user_id', user_id);

            if (existingError) throw existingError;

            const existingInterestIds = new Set(existingInterests.map((item) => item.interest_id));

            const { data: allInterests, error: fetchError } = await supabase
                .from('Interests')
                .select('id, Interest')
                .in('Interest', selectedInterestNames);

            if (fetchError) throw fetchError;
            const newInterestIds = allInterests.map((interest) => interest.id);

            const interestsToAdd = newInterestIds.filter((id) => !existingInterestIds.has(id));
            const interestsToRemove = Array.from(existingInterestIds).filter((id) => !newInterestIds.includes(id));

            if (interestsToAdd.length > 0) {
                await supabase
                    .from('Interested in')
                    .insert(interestsToAdd.map((id) => ({ user_id: user_id, interest_id: id })));
            }

            if (interestsToRemove.length > 0) {
                await supabase
                    .from('Interested in')
                    .delete()
                    .eq('user_id', user_id)
                    .in('interest_id', interestsToRemove);
            }
            message.success({content: "Interesse opgeslagen", style:{fontSize:'20px'} })
        } catch (error) {
            console.error('Error updating interests:', error);
            message.error("probleem bij het opslaan van interesse")
        }
    };


    const handleBiographyChange = (e) => {
        const newValue = e.target.value;
        setBiography(newValue);
    };

    const handleBiographySave = (e) => {
        const newValue = e.target.value;
        setBiography(newValue);
        saveField(user_id, 'bio', newValue)
    }

    const handleLocationChange = (value) => {
        setLocation(value);
        saveField(user_id, 'location', value);
    };

    const handleGenderChange = (value) => {
        setGender(value);
        saveField(user_id, 'gender', value);
    };

    const handleCheckboxChange = async (value) => {
        const updatedLookingFor = [...lookingForArray];
        if (updatedLookingFor.includes(value)) {
            const index = updatedLookingFor.indexOf(value);
            updatedLookingFor.splice(index, 1);
        } else {
            updatedLookingFor.push(value);
        }

        setLookingForArray(updatedLookingFor);

        try {
            const {data, error} = await supabase
                .from('User information')
                .update({looking_for: updatedLookingFor})
                .eq('user_id', user_id);
            if (error) throw error;

            message.success({content: "op zoek naar opgeslagen", style:{fontSize:'20px'}})
            console.log(`Looking for updated successfully width value ${updatedLookingFor}`);
        } catch (error) {
            message.error({content: "probleem bij het opslaan van op zoek naar", style:{fontSize:'20px'}})
            console.error('Error saving looking for:', error);
        };
    };

    const handleLivingChange = (value) => {
        setLivingSituation(value);
        saveField(user_id, 'living_situation', value);
    }

    const handleMobilityChange = (value)=>{
        setMobility(value);
        saveField(user_id, 'mobility', value);
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
                                width = height * maxAspectRatio;
                            }

                            canvas.width = width;
                            canvas.height = height;

                            ctx.drawImage(
                                img,
                                (img.width - width) / 2,
                                0,
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
                                1
                            );
                        };
                        img.onerror = () => reject("Invalid image file.");
                        img.src = reader.result;
                    };
                    reader.onerror = () => reject("Error reading file.");
                    reader.readAsDataURL(file);
                });
            };

            const croppedFile = await cropImage(file);

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

            const { error: dbInsertError } = await supabase
                .from('Pictures')
                .insert({ User_id: user_id, picture_url: imageUrl });

            if (dbInsertError) throw dbInsertError;

            setImages((prevImages) => {
                const updatedImages = [...prevImages, imageUrl];

                setTimeout(() => {
                    if (carouselRef.current) {
                        carouselRef.current.goTo(updatedImages.length);
                    }
                }, 300);

                return updatedImages;
            });

        } catch (error) {
            message.error(error.message);
            message.error({content: "foto opgeslagen", style:{fontSize:'20px'}})
        } finally {
            setUploadingPicture(false);
            message.success({content: "foto opgeslagen", style:{fontSize:'20px'}})
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

            setImages((prevImages) => {
                return prevImages.filter((url) => url !== imageUrlToRemove);
            });
        } catch (error) {
            console.error('Error removing profile picture:', error);
            message.error({content: 'probleem bij het verwijderen van de foto', style:{fontSize:'20px'}})
        } finally {
            setRemovingPicture(false);
            message.success({content: 'foto verwijdert', style:{fontSize:'20px'}})
        }
    };

    const handleProfilePictureUpload = async ({ file }) => {
        try {
            setUploading(true);

            const imageUrlWithCacheBuster = await requests(user_id, file, 'profile-pictures');

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
    const { Title } = Typography;

    const styles = {
        title: {
            flexGrow: 1,
            textAlign: 'center',
            margin: 0,
            fontSize: '48px',
            transform: 'scale(1.5)',
            paddingTop: '15px',
        },
    };


    if (isLoading) return <Spin tip="Profiel laden..." />;
    if (error) return <p>Failed to load profile: {error}</p>;

    return (
        <ConfigProvider theme={{token: antThemeTokens(themeColors)}}>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                minWidth: '100dvw',
                minHeight: '100vh',
                overflow: 'hidden',
                backgroundColor: themeColors.primary2,
                color: themeColors.primary10,
                zIndex: '0'
            }}>
                <div
                    style={{
                        width: '80%',
                        boxSizing: 'border-box',
                    }}
                >
                    <div style={styles.titleButton}>
                        <Title level={1} style={{...styles.title, fontSize: '64px'}}>Jouw profiel</Title>
                    </div>
                    <HomeButtonUser color={themeColors.primary7}/>
                    <ButterflyIcon color={themeColors.primary3}/>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        paddingBottom: '20px',
                        marginTop: '20px'
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px'}}>
                            <Avatar
                                src={profilePicture}
                                alt={name}
                                style={{
                                    minHeight: '100px',
                                    minWidth: '100px',
                                    height: '15dvw',
                                    width: '15dvw',
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

                    <p style={{width: '100%'}}>
                        <strong style={{display: 'block', marginBottom: '10px'}}>
                            <BookOutlined/> Biografie
                        </strong>
                        <div style={{position: 'relative', width: '100%', minWidth: '200px'}}>
                            <TextArea
                                style={{width: '100%', paddingBottom: '20px'}}
                                rows={3}
                                placeholder="Vertel iets over jezelf"
                                value={biography}
                                onChange={handleBiographyChange}
                                onBlur={handleBiographySave}
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

                    <p style={{width: '100%'}}>
                        <strong style={{display: 'block', marginBottom: '10px'}}>
                            <EnvironmentOutlined/> Locatie
                        </strong>
                        <Select
                            showSearch
                            style={{width: '100%', minWidth: '200px'}}
                            placeholder="Zoek en selecteer uw locatie"
                            value={location}
                            onChange={handleLocationChange}
                            onSearch={handleSearch}
                            filterOption={false}
                            options={locations.map((location) => ({
                                value: location.id,
                                label: location.Gemeente + ' (' + location.Postcode + ')',
                            }))}
                            notFoundContent={
                                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span role="img" aria-label="no data" style={{fontSize: '2rem'}}>
                    <EnvironmentOutlined/>
                </span>
                                    <span>Locatie niet gevonden</span>
                                </div>
                            }
                            dropdownRender={(menu) => (
                                <div
                                    onWheel={(e) => e.stopPropagation()}
                                    style={{maxHeight: 300}}
                                >
                                    {menu}
                                </div>
                            )}
                        />
                    </p>


                    <Divider/>

                    <p style={{width: '100%'}}>
                        <strong style={{display: 'block', marginBottom: '10px'}}>
                            <UserOutlined/> Geslacht
                        </strong>
                        <Select
                            style={{width: '100%', minWidth: '200px'}}
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

                    <p style={{width: '100%'}}>
                        <strong style={{display: 'block', marginBottom: '10px'}}>
                            <StarOutlined/> Interesses
                        </strong>
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Selecteer interesses of voeg toe"
                            style={{width: '100%', minWidth: '200px'}}
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
                <span
                    role="img"
                    aria-label="no data"
                    style={{fontSize: '2rem'}}
                >
                    <PlusCircleOutlined/>
                </span>
                                    <span>Druk op enter om deze nieuwe interesse toe te voegen</span>
                                </div>
                            }
                            dropdownRender={(menu) => (
                                <div
                                    onWheel={(e) => e.stopPropagation()}
                                    style={{maxHeight: 300}}
                                >
                                    {menu}
                                </div>
                            )}
                        />
                    </p>


                    <Divider/>

                    <p style={{width: '100%'}}>
                        <strong style={{display: 'block', marginBottom: '10px'}}>
                            <HeartOutlined/> Ik zoek naar
                        </strong>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                minWidth: '200px'
                            }}
                        >
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

                    <p style={{width: '100%'}}>
                        <strong style={{display: 'block', marginBottom: '10px'}}>
                            <HomeOutlined/> Woonsituatie
                        </strong>
                        <Select
                            placeholder="Selecteer jouw woonsituatie"
                            value={livingSituation}
                            style={{width: '100%', minWidth: '200px'}}
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

                    <p style={{width: '100%'}}>
                        <strong style={{display: 'block', marginBottom: '10px'}}>
                            <CarOutlined/> Kan zich zelfstanding verplaatsen
                        </strong>
                        <Select
                            value={mobility}
                            style={{width: '100%', minWidth: '200px'}}
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
                            <strong style={{width: '40%', minWidth: '100px', flexShrink: 0}}>
                                <PictureOutlined/> Meer fotos van jezelf tonen
                            </strong>
                        </p>
                        <Carousel
                            ref={carouselRef}
                            prevArrow={<CustomPrevArrow/>}
                            nextArrow={<CustomNextArrow/>}
                            arrows
                            slidesToShow={slidesToShow}
                            draggable
                            infinite={false}
                            style={{
                                maxWidth: '80%',
                                height: '150px',
                                margin: '0 auto'
                            }}
                        >
                            <Upload showUploadList={false} beforeUpload={() => false} onChange={handlePictureUpload}
                                    multiple>
                                <Button icon={<UploadOutlined/>} loading={uploadingPicture} style={{
                                    position: 'relative',
                                    height: '150px',
                                }}>
                                    Voeg foto toe aan profiel
                                </Button>
                            </Upload>

                            {images.map((imageUrl, index) => (
                                <div
                                    key={index}
                                    style={{
                                        position: 'relative',
                                        height: '150px',
                                    }}
                                >
                                    <img
                                        src={imageUrl}
                                        alt={`carousel-image-${index}`}
                                        style={{
                                            height: '150px',
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
                                                height: '150px',
                                                width: '150px',
                                                position: 'relative',
                                                top: `-75px`,
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
            </div>
        </ConfigProvider>
    );
};

export default ProfileCard;