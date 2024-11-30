import {useEffect, useState} from "react";
import {createClient} from "@supabase/supabase-js";

const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q")


const useFetchCaretakerData = (actCode, options = { fetchOrganization: true }) => {
    const [profileData, setProfileData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch caretaker data
                const { data: userData, error: userError } = await supabase
                    .from("Caretaker")
                    .select("*")
                    .eq("id", actCode);

                if (userError) throw userError;

                if (userData.length > 0) {
                    const user = userData[0];

                    // Parse theme
                    let parsedTheme = "blauw";
                    let isDarkMode = false;

                    if (user.theme) {
                        try {
                            const [themeName, darkModeFlag] = JSON.parse(user.theme);
                            parsedTheme = themeName;
                            isDarkMode = darkModeFlag;
                        } catch (err) {
                            console.error("Error parsing theme:", err);
                        }
                    }

                    // Fetch organization data if requested
                    if (options.fetchOrganization) {
                        const { data: userOrganization, error: userOrganizationError } = await supabase
                            .from("Activation")
                            .select("organization")
                            .eq("code", user.id);

                        if (userOrganizationError) throw userOrganizationError;

                        if (userOrganization && userOrganization.length > 0) {
                            user.organization = userOrganization[0].organization;
                        }
                    }

                    // Set the profile data
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
    }, [actCode, options.fetchOrganization]);

    return { profileData, isLoading, error };
};

export default useFetchCaretakerData;
