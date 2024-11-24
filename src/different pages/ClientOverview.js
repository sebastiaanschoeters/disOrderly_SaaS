import React, { useEffect, useState } from "react";
import { Avatar, ConfigProvider, Select, Table, Button, message } from "antd";
import { antThemeTokens, ButterflyIcon, themes } from "../themes";
import { createClient } from "@supabase/supabase-js";
import {DeleteOutlined} from "@ant-design/icons";

const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q");

const useFetchClients = (actCode) => {
    const [clients, setClients] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: clientData, error: clientsError } = await supabase
                    .from("User")
                    .select("*")
                    .eq("caretaker", actCode);

                if (clientsError) throw clientsError;

                const transformedClients = clientData.map((client) => [
                    client.profile_picture,
                    client.name,
                    client.access_level,
                    client.id
                ]);

                setClients(transformedClients);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchData();
    }, [actCode]);

    return { clients, error };
};

const useFetchTheme = (actCode) => {
    const [profileData, setProfileData] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: profileInfo, error: profileError } = await supabase
                    .from("Caretaker")
                    .select("theme")
                    .eq("id", actCode);

                if (profileError) throw profileError;

                if (profileInfo.length > 0) {
                    const user = profileInfo[0];

                    let parsedTheme = "blauw";
                    let isDarkMode = false;

                    if (user.theme) {
                        try {
                            const [themeName, darkModeFlag] = JSON.parse(user.theme);
                            parsedTheme = themeName;
                            isDarkMode = darkModeFlag;
                        } catch (error) {
                            console.error("Error parsing theme", error);
                        }
                        setProfileData({
                            ...user,
                            theme: isDarkMode ? `${parsedTheme}_donker` : parsedTheme,
                        });
                    }
                }
            } catch (error) {
                setError(error.message);
            }
        };

        fetchData();
    }, [actCode]);

    return { profileData };
};

// New function to handle account deactivation (delete)
const deleteClient = async (clientId) => {
    try {
        const { error } = await supabase
            .from("User")
            .delete() // Assuming there's an 'active' field to deactivate the account
            .eq("id", clientId);

        if (error) throw error;

        message.success("Client account deactivated successfully!");
    } catch (error) {
        message.error("Failed to deactivate client account: " + error.message);
    }
};

const ClientOverview = () => {
    const { clients, error } = useFetchClients(1111);
    const { profileData } = useFetchTheme(1111);
    const theme = profileData.theme || "blauw";
    const themeColors = themes[theme] || themes.blauw;

    const handleAccessLevelChange = (id, value) => {
        console.log(`Client ID: ${id}, New Access Level: ${value}`);
    };

    const handleDelete = (clientId) => {
        // Call deleteClient function to deactivate the account
        deleteClient(clientId);
    };

    const columns = [
        {
            dataIndex: "client_info",
            key: "client_info",
            render: (clientInfo) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                        src={clientInfo.profile_picture}
                        alt="Profile Picture"
                        size={64}
                        style={{ marginRight: 10 }}
                    />
                    <span>{clientInfo.name}</span>
                </div>
            ),
        },
        {
            title: "Access Level",
            dataIndex: "access_level",
            key: "access_level",
            render: (accessLevel, record) => (
                <Select
                    defaultValue={accessLevel}
                    onChange={(value) => handleAccessLevelChange(record.id, value)}
                    style={{ Width: '50%' }}
                    options={[
                        { value: "Volledige toegang", label: "Volledige toegang" },
                        { value: "Gesprekken", label: "Gesprekken" },
                        { value: "Contacten", label: "Contacten" },
                        { value: "Publiek Profiel", label: "Publiek Profiel" },
                    ]}
                />
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Button
                    type="default"
                    onClick={() => handleDelete(record.id)}
                    style={{
                        fontSize: '1rem',
                    }}
                >
                    Deactiveer Account<DeleteOutlined/>
                </Button>
            ),
        },
    ];

    const dataSource = clients.map((clientArray) => ({
        client_info: {
            profile_picture: clientArray[0],
            name: clientArray[1],
        },
        access_level: clientArray[2],
        id: clientArray[3],
    }));

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div
                style={{
                    padding: "20px",
                    position: "relative",
                    minWidth: "100%",
                    minHeight: "100vh",
                    backgroundColor: themeColors.primary2,
                    color: themeColors.primary10,
                    zIndex: "0",
                }}
            >
                <ButterflyIcon color={themeColors.primary3} />
                {error && <p>Error: {error}</p>}
                {clients.length > 0 ? (
                    <Table
                        dataSource={dataSource}
                        columns={columns}
                        showHeader={false}
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                        style={{
                            marginTop: "20px",
                            backgroundColor: themeColors.primary1,
                        }}
                    />
                ) : (
                    <p>Loading clients...</p>
                )}
            </div>
        </ConfigProvider>
    );
};

export default ClientOverview;
