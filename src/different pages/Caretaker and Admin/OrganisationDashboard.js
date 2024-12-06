import 'antd/dist/reset.css'; // Import Ant Design styles
import '../../CSS/AntDesignOverride.css'
import { antThemeTokens, themes } from '../../Extra components/themes';
import {
    Button,
    Card,
    ConfigProvider, Flex,
    Form,
    Input,
    List,
    Modal,
    Select
} from 'antd';
import {PlusOutlined, RedoOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q");

const OrganisationDashboard = () => {
    const [organisationId, setOrganisationId] = useState(null);
    const userId = localStorage.getItem("user_id");
    const themeColors = themes["blauw"] || themes.blauw;

    const fetchOrganisation = async () => {
        console.log("userId: ", userId)
        const { data, error } = await supabase.from("Organisations").select().eq("responsible", userId);
        console.log("Data: ", data);


    }

    useEffect(() => {
        fetchOrganisation()
    }, []);

    return (<ConfigProvider theme={{token: antThemeTokens(themeColors)}}>

        <div>

        </div>

    </ConfigProvider>)
    }



export default OrganisationDashboard;