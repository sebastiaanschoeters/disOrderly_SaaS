import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { assembleProfileData } from "../Api/Utils";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
            const { profileData, error } = await assembleProfileData(actCode);
            if (error) {
                setError(error);
            } else {
                setProfileData(profileData)
            }
            setIsLoading(false);
        };

        fetchData();
    }, [actCode]);

    return { profileData, isLoading, error, interest };
};

export default useFetchProfileData;
