import React, {useEffect, useState} from 'react';
import {Avatar, Button, Carousel, Checkbox, ConfigProvider, Divider, message, Select, Spin, Upload} from 'antd';
import {
    BookOutlined,
    CarOutlined,
    DeleteOutlined,
    EnvironmentOutlined,
    HeartOutlined,
    HomeOutlined,
    LeftOutlined, MailOutlined, PhoneOutlined,
    PictureOutlined,
    PlusCircleOutlined,
    RightOutlined,
    StarOutlined, TeamOutlined,
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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user data
                const { data: userData, error: userError } = await supabase
                    .from('Caretaker')
                    .select('*')
                    .eq('id', actCode);

                if (userError) throw userError;

                if (userData.length > 0) {
                    const user = userData[0];

                    let parsedTheme = 'blauw';
                    let isDarkMode = false;

                    if (user.theme) {
                        try {
                            const [themeName, darkModeFlag] = JSON.parse(user.theme);
                            parsedTheme = themeName;
                            isDarkMode = darkModeFlag;
                        } catch (error) {
                            console.error('Error parsing theme', error);
                        }
                    }

                    // Fetch user information
                    const { data: userOrganization, error: userOrganizationError } = await supabase
                        .from('Activation')
                        .select('organization')
                        .eq('code', user.id);

                    if (userOrganizationError) throw userOrganizationError;

                    if (userOrganization && userOrganization.length > 0) {
                        const userOrganizationData = userOrganization[0];
                        user.organization = userOrganizationData.organization;
                    }

                    console.log(user)
                    // Set the user profile data with the theme
                    setProfileData({
                        ...user,
                        theme: isDarkMode ? `${parsedTheme}_donker` : parsedTheme
                    });
                }
            } catch (error) {
                setError(error.message);
            } finally {
                console.log("user element: ", profileData)
                setIsLoading(false);
            }
        };

        fetchData();
    }, [actCode]);

    return { profileData, isLoading, error };
};

const ProfileCard = () => {
    const [theme, setTheme] = useState('blauw');
    const themeColors = themes[theme] || themes.blauw;
    const [profilePicture, setProfilePicture] = useState('https://example.com/photo.jpg');
    const [uploading, setUploading] = useState(false);
    // const { profileData, isLoading, error, interest} = useFetchProfileData(localStorage.getItem('user_id'));
    const { profileData, isLoading, error} = useFetchProfileData(1111)
    const [phoneNumber, setPhoneNumber] = useState('')
    const [email, setEmail] = useState('')

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
        if (profileData.phone_number) {
            setPhoneNumber(profileData.phone_number)
        }
        if (profileData.email){
            setEmail(profileData.email)
        }
    }, [profileData]);

    // Define async save functions
    const saveField = async (field, value) => {
        try {
            const { data, error } = await supabase
                .from('Caretaker')
                .update({ [field]: value })
                .eq('id', profileData.id);
            if (error) throw error;

            console.log(`${field} saved successfully with value ${value}`);
        } catch (error) {
            console.error(`Error saving ${field}:`, error);
        }
    };

    const debounceSavePhoneNumber = debounce((value) => saveField('phone_number', value), 1000);
    const debounceSaveEmail = debounce((value) => saveField('email', value), 1000);

    const handlePhoneNumberChange = (e) => {
        const newValue = e.target.value;
        setPhoneNumber(newValue);
        debounceSavePhoneNumber(newValue);
    }

    const handleEmailChange = (e) => {
        const newValue = e.target.value;
        setEmail(newValue);
        debounceSaveEmail(newValue);
    }

    const handleProfilePictureUpload = async ({ file }) => {
        try {
            setUploading(true);
            const fileName = `${profileData.id}-profilePicture`;

            // Check if the file already exists and remove it before upload
            const { data: existingFiles, error: listError } = await supabase.storage
                .from('profile-pictures-caretakers')
                .list('', { search: profileData.id });

            if (listError) {
                console.error('Error checking existing files:', listError);
            } else {
                const existingFile = existingFiles.find(item => item.name.startsWith(profileData.id));
                if (existingFile) {
                    // Remove the existing file if it exists
                    const { error: deleteError } = await supabase.storage
                        .from('profile-pictures-caretakers')
                        .remove([existingFile.name]);
                    if (deleteError) {
                        throw deleteError;
                    }
                }
            }

            // Upload the new file
            const { data, error: uploadError } = await supabase.storage
                .from('profile-pictures-caretakers')
                .upload(fileName, file, { upsert: true }); // upsert ensures replacement if file exists
            if (uploadError) {
                throw uploadError;
            }

            const { data: fileData, error: urlError } = supabase.storage
                .from('profile-pictures-caretakers')
                .getPublicUrl(fileName);
            if (urlError) {
                throw urlError;
            }

            const imageUrl = fileData.publicUrl;

            const imageUrlWithCacheBuster = `${imageUrl}?t=${new Date().getTime()}`;
            setProfilePicture(imageUrlWithCacheBuster);


            // Save the new image URL to the user's profile
            await supabase
                .from('Caretaker')
                .update({ profile_picture: imageUrl })
                .eq('id', profileData.id);

        } catch (error) {
            console.error('Error uploading profile picture:', error);
        } finally {
            setUploading(false);
        }
    };

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
                                {profileData.name || 'Naam'}
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
                        <PhoneOutlined/> Telefoon nummer:
                    </strong>
                    <TextArea
                        style={{width: '100%', paddingBottom: '20px'}}
                        placeholder="Geef je telefoon nummer in"
                        value={phoneNumber}
                        onChange={handlePhoneNumberChange}
                    />
                </p>

                <Divider/>

                <p style={{display: 'flex', alignItems: 'center', width: '100%', gap: '2%'}}>
                    <strong style={{width: '20%', minWidth: '150px'}}>
                        <MailOutlined/> E-mail:
                    </strong>
                    <TextArea
                        style={{width: '100%', paddingBottom: '20px'}}
                        placeholder="Geef je e-mail adres in"
                        value={email}
                        onChange={handleEmailChange}
                    />
                </p>

                <Divider/>

                <p style={{display: 'flex', alignItems: 'center', width: '100%', gap: '2%'}}>
                    <strong style={{width: '20%', minWidth: '150px'}}>
                        <TeamOutlined/> Organizatie:
                    </strong>
                    <p>
                        {profileData.organization}
                    </p>
                </p>
            </div>
        </ConfigProvider>
    );
};

export default ProfileCard;