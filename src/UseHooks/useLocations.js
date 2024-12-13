import { useState, useEffect } from 'react';
import {createClient} from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabaseSchema = process.env.REACT_APP_SUPABASE_SCHEMA;
const supabase = createClient(supabaseUrl, supabaseKey, {db: {schema: supabaseSchema}});

const useLocations = (searchTerm = "") => {
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const { data, error } = await supabase
                    .from("Location")
                    .select("id, Gemeente, Postcode")
                    .ilike("Gemeente", `%${searchTerm}%`)
                    .limit(10);

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
    }, [searchTerm]);

    return { locations };
};

export default useLocations;
