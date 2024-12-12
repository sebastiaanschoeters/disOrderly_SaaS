import {createClient} from "@supabase/supabase-js";
import {message} from "antd";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const getName = async (user_id, options={caretaker: false}) => {
    try {
        let data = {};
        let error = {};
        if (options.caretaker){
            const {data: caretakerData, error: caretakerError} = await supabase
                .from('Caretaker')
                .select('name')
                .eq('id', user_id);
            data = caretakerData;
            error = caretakerError;
        } else {
            const {data: userData, error: userError} = await supabase
                .from('User')
                .select('name')
                .eq('id', user_id);
            data = userData;
            error = userError;
        }

        if (error) {
            console.error('Error fetching user_id:', error.message);
            return null;
        }

        if (data.length === 0) {
            console.log('No user found with the provided user_id.');
            return null;
        }

        console.log('Fetched name:', data[0].name);
        return data[0].name;  // Ensure it's a string
    } catch (err) {
        console.error('Unexpected error:', err);
        return null;
    }
};

export const getTheme = async (user_id, options={caretaker:false}) => {
    try {
        let data = {};
        let error = {};
        if (options.caretaker){
            const {data: caretakerData, error: caretakerError} = await supabase
                .from('Caretaker')
                .select('theme')
                .eq('id', user_id);
            data = caretakerData;
            error = caretakerError;
        } else {
            const {data: userData, error: userError} = await supabase
                .from('User information')
                .select('theme')
                .eq('user_id', user_id);
            data = userData;
            error = userError;
        }

        if (error) {
            console.error('Error fetching user theme:', error.message);
            return null;
        }

        if (data.length === 0) {
            console.log('No user found with the provided user_id.');
            return null;
        }

        return data[0].theme; // Returning the theme directly
    } catch (err) {
        console.error('Unexpected error:', err);
        return null;
    }
};

export const getPfp = async (user_id, options={caretaker:false}) => {
    try {
        let data = {};
        let error = {};
        if (options.caretaker){
            const {data: caretakerData, error: caretakerError} = await supabase
                .from('Caretaker')
                .select('profile_picture')
                .eq('id', user_id);
            data = caretakerData;
            error = caretakerError;
        } else {
            const {data: userData, error: userError} = await supabase
                .from('User')
                .select('profile_picture')
                .eq('id', user_id);
            data = userData;
            error = userError;
        }

        if (error) {
            console.error('Error fetching pfp:', error.message);
            return null;
        }

        if (data.length === 0) {
            console.log('No user found with the provided email.');
            return null;
        }

        console.log('Fetched pfp:', data[0].profile_picture);
        return data[0].profile_picture; // Ensure it's a string
    } catch (err) {
        console.error('Unexpected error:', err);
        return null;
    }
};

export const getUserEmailById = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('Credentials')
            .select('email')
            .eq('user_id', userId)

        if (error) {
            console.error('Error fetching email:', error.message);
            return null;
        }

        if (data.length === 0) {
            console.log('No user found with the provided userid.');
            return null;
        }

        return data;
    } catch (err) {
        console.error('Unexpected error:', err);
        return null;
    }
};

export const saveField = async (userId, field, value) => {
    // Map English field names to Dutch equivalents
    const fieldTranslations = {
        bio: "biografie",
        location: "locatie",
        gender: "geslacht",
        living_situation: "woonsituatie",
        mobility: "mobiliteit",
        theme: "thema",
        sexuality: "seksualiteit",
    };

    const dutchField = fieldTranslations[field] || field;

    try {
        const { error } = await supabase
            .from('User information')
            .update({ [field]: value })
            .eq('user_id', userId);

        if (error) {
            message.error(`Probleem bij het opslaan van ${dutchField}`);
            console.error(`Error saving ${dutchField}:`, error);
            return; // Early return to exit function on error
        }

        // Display success message
        message.success(`${dutchField} opgeslagen`);
        console.log(`${field} saved successfully with value ${value}`);
    } catch (error) {
        message.error(`Onverwachte fout bij het opslaan van ${dutchField}`);
        console.error(`Unexpected error saving ${dutchField}:`, error);
    }
};

export const fetchUserData = async (userId) => {
    const { data: userData, error: userError } = await supabase
        .from('User')
        .select('id, name, birthdate, profile_picture')
        .eq('id', userId);

    if (userError) throw userError;
    return userData.length > 0 ? userData[0] : null;
}

export const fetchUserInfo = async (userId) => {
    const { data: userInfo, error: userInfoError } = await supabase
        .from('User information')
        .select('*')
        .eq('user_id', userId);

    if (userInfoError) throw userInfoError;
    return userInfo.length > 0 ? userInfo[0] : null;
};

export const parseTheme = (theme) => {
    let parsedTheme = 'blauw';
    let isDarkMode = false;

    if (theme) {
        try {
            const [themeName, darkModeFlag] = JSON.parse(theme);
            parsedTheme = themeName;
            isDarkMode = darkModeFlag;
        } catch (err) {
            console.error('Error parsing theme', err);
        }
    }

    return isDarkMode ? `${parsedTheme}_donker` : parsedTheme;
};

export const fetchLocationData = async (locationId) => {
    if (!locationId) return null;

    const { data: locationData, error: locationError } = await supabase
        .from('Location')
        .select('Gemeente, Longitude, Latitude')
        .eq('id', locationId);

    if (locationError) throw locationError;
    return locationData.length > 0 ? locationData[0] : null;
};

export const fetchUserInterests = async (userId) => {
    const { data: interestedInData, error: interestedInError } = await supabase
        .from('Interested in')
        .select('interest_id')
        .eq('user_id', userId);

    if (interestedInError) throw interestedInError;

    if (interestedInData.length === 0) return [];

    const interestIds = interestedInData.map((item) => item.interest_id);
    const { data: interestsData, error: fetchInterestsError } = await supabase
        .from('Interests')
        .select('Interest')
        .in('id', interestIds);

    if (fetchInterestsError) throw fetchInterestsError;

    return interestsData.map((interest) => ({
        interest_name: interest.Interest,
    }));
};

export const assembleProfileData = async (userId) => {
    const result = { profileData: null, error: null };

    try {
        const user = await fetchUserData(userId);
        if (!user) {
            result.error = "User not found";
            return result;
        }

        const userInfo = await fetchUserInfo(userId);
        if (userInfo) {
            user.bio = userInfo.bio;
            user.location = userInfo.location;
            user.looking_for = userInfo.looking_for;
            user.living_situation = userInfo.living_situation;
            user.mobility = userInfo.mobility;
            user.gender = userInfo.gender;
            user.sexuality = userInfo.sexuality;
            user.theme = parseTheme(userInfo.theme);

            if (userInfo.location) {
                const location = await fetchLocationData(userInfo.location);
                user.locationData = {
                    gemeente: location.Gemeente,
                    latitude: location.Latitude,
                    longitude: location.Longitude,
                };
            }
        }

        user.interests = await fetchUserInterests(userId);
        result.profileData = user;
    } catch (error) {
        console.error("Error assembling profile data for user:", userId, error);
        result.error = error.message;
    }

    return result;
};

// In Utils.js
export const handleProfileClick = (client, setSelectedClient, setIsModalProfileVisible) => {
    setSelectedClient({ id: client });
    setIsModalProfileVisible(true);
};

export const handleModalProfileClose = (setSelectedClient, setIsModalProfileVisible) => {
    setSelectedClient({});
    setIsModalProfileVisible(false);
};
