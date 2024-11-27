import React, { useEffect, useState } from "react";
import { Avatar, ConfigProvider, Select, Table, Button, message } from "antd";
import { antThemeTokens, ButterflyIcon, themes } from "../themes";
import { createClient } from "@supabase/supabase-js";
import { DeleteOutlined } from "@ant-design/icons";
import 'antd/dist/reset.css';
import '../CSS/AntDesignOverride.css';

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
            .delete()
            .eq("id", clientId);

        if (error) throw error;

        const { infoError } = await supabase
            .from("User information")
            .delete()
            .eq("user_id", clientId)

        if (infoError) throw infoError;

        message.success("Klantaccount succesvol gedeactiveerd!");
    } catch (error) {
        message.error("Klantaccount deactiveren is mislukt: " + error.message);
    }
};

const useFetchCaretakers = (organizationId) => {
    const [caretakers, setCaretakers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: activationData, error: idError } = await supabase
                    .from("Activation")
                    .select("code")
                    .eq("organization", organizationId);

                if (idError) throw new Error(`Fout bij het ophalen van activatiecodes: ${idError.message}`);
                if (!activationData || activationData.length === 0) {
                    setCaretakers([]);
                    return;
                }

                const caretakerIds = activationData.map((item) => item.code);

                const { data: caretakerData, error: caretakersError } = await supabase
                    .from("Caretaker")
                    .select("name, profile_picture")
                    .in("id", caretakerIds);

                if (caretakersError) throw new Error(`Fout bij het ophalen van begeleiders: ${caretakersError.message}`);

                setCaretakers(caretakerData || []);
            } catch (error) {
                setError(error.message);
            }
        };

        if (organizationId) fetchData();
    }, [organizationId]);

    return { caretakers, error };
};

const ClientOverview = () => {
    const { clients, error } = useFetchClients(1111);
    const { caretakers } = useFetchCaretakers('KUL')
    const { profileData } = useFetchTheme(1111);
    const theme = profileData.theme || "blauw";
    const themeColors = themes[theme] || themes.blauw;

    const handleAccessLevelChange = (id, value) => {
        console.log(`Klant ID: ${id}, Nieuw Toegangsniveau: ${value}`);
    };

    const handleDelete = (clientId) => {
        deleteClient(clientId);
    };

    const handleCaretakerChange = async (clientId, newCaretakerId) => {
        try {
            const { error } = await supabase
                .from("User")
                .update({ caretaker: newCaretakerId })
                .eq("id", clientId);

            if (error) throw error;

            message.success("Begeleider succesvol bijgewerkt!");
        } catch (error) {
            message.error("Fout bij het bijwerken van begeleider: " + error.message);
        }
    };

    const handleRowClick = (record) => {
        console.log("Row clicked: ", record);
        // Add additional functionality here (e.g., navigation or modal display)
    };

    const columns = [
        {
            dataIndex: "client_info",
            key: "client_info",
            render: (clientInfo) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                        src={clientInfo.profile_picture}
                        alt="Profielfoto"
                        size={64}
                        style={{ marginRight: 10 }}
                    />
                    <span>{clientInfo.name}</span>
                </div>
            ),
        },
        {
            title: "Toegangsniveau",
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
            title: "Acties",
            key: "actions",
            render: (_, record) => (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <Select
                        placeholder="Verander begeleiding"
                        onChange={(value) => handleCaretakerChange(record.id, value)}
                        options={caretakers.map((caretaker) => ({
                            value: caretaker.id,
                            label: caretaker.name,
                        }))}
                        style={{ width: '100%' }}
                    />
                    <Button
                        type="default"
                        onClick={() => handleDelete(record.id)}
                        style={{
                            fontSize: "1rem",
                        }}
                    >
                        Account Deactiveren <DeleteOutlined />
                    </Button>
                </div>
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
                {error && <p>Fout: {error}</p>}
                {clients.length > 0 ? (
                    <Table
                        dataSource={dataSource}
                        columns={columns}
                        showHeader={false}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        onRow={(record) => ({
                            onClick: () => handleRowClick(record),
                        })}
                        style={{
                            marginTop: "20px",
                            backgroundColor: themeColors.primary1,
                        }}
                    />
                ) : (
                    <p>Cliënten laden...</p>
                )}
            </div>
        </ConfigProvider>
    );
};

export default ClientOverview;
