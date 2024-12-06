import { useState, useEffect } from "react";
import {createClient} from "@supabase/supabase-js";

const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q")

const useFetchProfileData = (actCode, options = { fetchAllInterests: false }) => {
    const [profileData, setProfileData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [interest, setInterests] = useState([]);

    useEffect(() => {
        // Fetch global list of interests if requested
        const fetchAllInterests = async () => {
            if (options.fetchAllInterests) {
                try {
                    const { data: interestList, error } = await supabase.from("Interests").select("Interest");
                    if (error) throw error;
                    setInterests(interestList || []);
                } catch (err) {
                    console.error("Error fetching interests:", err);
                }
            }
        };

        fetchAllInterests();
    }, [options.fetchAllInterests]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user data
                const { data: userData, error: userError } = await supabase
                    .from("User")
                    .select("id, name, birthdate, profile_picture")
                    .eq("id", actCode);

                if (userError) throw userError;

                if (userData.length > 0) {
                    const user = userData[0];

                    // Fetch user information
                    const { data: userInfoData, error: userInfoError } = await supabase
                        .from("User information")
                        .select("*")
                        .eq("user_id", user.id);

                    if (userInfoError) throw userInfoError;

                    let parsedTheme = "blauw";
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
                        user.sexuality = userInfo.sexuality;

                        if (userInfo.theme) {
                            try {
                                const [themeName, darkModeFlag] = JSON.parse(userInfo.theme);
                                parsedTheme = themeName;
                                isDarkMode = darkModeFlag;
                            } catch (err) {
                                console.error("Error parsing theme", err);
                            }
                        }

                        // Fetch location details using location ID
                        if (userInfo.location) {
                            const { data: locationData, error: locationError } = await supabase
                                .from("Location")
                                .select("Gemeente, Longitude, Latitude")
                                .eq("id", userInfo.location);

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
                    }

                    // Fetch user's interests
                    const { data: interestedInData, error: interestedInError } = await supabase
                        .from("Interested in")
                        .select("interest_id")
                        .eq("user_id", user.id);

                    if (interestedInError) throw interestedInError;

                    if (interestedInData && interestedInData.length > 0) {
                        const interestIds = interestedInData.map((item) => item.interest_id);
                        const { data: interestsData, error: fetchInterestsError } = await supabase
                            .from("Interests")
                            .select("Interest")
                            .in("id", interestIds);

                        if (fetchInterestsError) throw fetchInterestsError;

                        user.interests = interestsData.map((interest) => ({
                            interest_name: interest.Interest,
                        }));
                    }

                    // Set user profile data
                    setProfileData({
                        ...user,
                        theme: isDarkMode ? `${parsedTheme}_donker` : parsedTheme,
                    });
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [actCode]);

    return { profileData, isLoading, error, interest };
};

export default useFetchProfileData;
