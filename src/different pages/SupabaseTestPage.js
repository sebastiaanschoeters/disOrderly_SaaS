import {useState, createContext, useEffect} from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q")

const SupabaseTestPage = () => {
    const [testData, setTestData] = useState([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const {data, error} = await supabase.from("Test Table").select("test_column")
            setTestData(data)
    }

    return (
        <div>
            {testData.map(data => (
                <li key={data.id}>{data.test_column}</li>
            ))}
        </div>
    );
}

export default SupabaseTestPage;