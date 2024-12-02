import { useState, useEffect } from 'react';
import {createClient} from "@supabase/supabase-js";

const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q")

const useLocations = (searchTerm = "") => {
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
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
            } catch (err) {
                console.error("Unexpected error:", err);
            }
        };

        fetchLocations();
    }, [searchTerm]); // Fetch locations whenever searchTerm changes

    return { locations };
};

export default useLocations;
