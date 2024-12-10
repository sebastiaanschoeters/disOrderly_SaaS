import {useEffect, useState} from "react";
import {createClient} from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
                            .select("Organisation: organisation(name, id)")
                            .eq("code", actCode);
                        console.log(userOrganization[0].Organisation.name)

                        if (userOrganizationError) throw userOrganizationError;

                        if (userOrganization && userOrganization.length > 0) {
                            user.organization = userOrganization[0].Organisation.name;
                            user.organizationId = userOrganization[0].Organisation.id;
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
