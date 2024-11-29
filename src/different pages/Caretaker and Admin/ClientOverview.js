import React, { useEffect, useState } from "react";
import { Avatar, ConfigProvider, Select, Table, Button, message } from "antd";
import { antThemeTokens, ButterflyIcon, themes } from "../../Extra components/themes";
import { createClient } from "@supabase/supabase-js";
import { DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import ClientDetailsModal from "./ClientDetailsModal";
import 'antd/dist/reset.css';
import '../../CSS/AntDesignOverride.css';

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

const useFetchProfileData = (actCode) => {
    const [profileData, setProfileData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user data
                const { data: userData, error: userError } = await supabase
                    .from('Caretaker')
                    .select('*')
                    .eq('id', actCode);

                if (userError) throw userError;

                if (userData.length > 0) {
                    const user = userData[0];

                    let parsedTheme = 'blauw';
                    let isDarkMode = false;

                    if (user.theme) {
                        try {
                            const [themeName, darkModeFlag] = JSON.parse(user.theme);
                            parsedTheme = themeName;
                            isDarkMode = darkModeFlag;
                        } catch (error) {
                            console.error('Error parsing theme', error);
                        }
                    }

                    console.log(user)
                    // Set the user profile data with the theme
                    setProfileData({
                        ...user,
                        theme: isDarkMode ? `${parsedTheme}_donker` : parsedTheme
                    });
                }
            } catch (error) {
                setError(error.message);
            } finally {
                console.log("user element: ", profileData)
                setIsLoading(false);
            }
        };

        fetchData();
    }, [actCode]);

    return { profileData };
};

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
    const { clients, error: fetchClientsError } = useFetchClients(1111);
    const { caretakers } = useFetchCaretakers("KUL");
    const { profileData } = useFetchProfileData(1111);
    const theme = profileData.theme || "blauw";
    const themeColors = themes[theme] || themes.blauw;

    const [localClients, setLocalClients] = useState(clients);
    const [pageSize, setPageSize] = useState(10);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        setLocalClients(clients);
    }, [clients]);

    useEffect(() => {
        const calculatePageSize = () => {
            const screenHeight = window.innerHeight;
            const rowHeight = 130; // Approximate row height
            const headerHeight = 160; // Approximate header and padding
            const footerHeight = 30; // Approximate footer height
            const availableHeight = screenHeight - headerHeight - footerHeight;

            return Math.max(1, Math.floor(availableHeight / rowHeight));
        };

        setPageSize(calculatePageSize());

        const handleResize = () => {
            setPageSize(calculatePageSize());
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const handleClientClick = (client) => {
        setSelectedClient(client);
        console.log(client)
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setSelectedClient(null);
        setIsModalVisible(false);
    };

    const handleAccessLevelChange = (id, value) => {
        console.log(`Klant ID: ${id}, Nieuw Toegangsniveau: ${value}`);
    };

    const handleDelete = (clientId) => {
        // deleteClient(clientId);
        setLocalClients((prevClients) =>
            prevClients.filter((client) => client[3] !== clientId)
        );
    };

    const handleCaretakerChange = async (clientId, newCaretakerId) => {
        try {
            const { error } = await supabase
                .from("User")
                .update({ caretaker: newCaretakerId })
                .eq("id", clientId);

            if (error) throw error;

            message.success("Begeleider succesvol bijgewerkt!");

            setLocalClients((prevClients) =>
                prevClients.map((client) =>
                    client[3] === clientId
                        ? { ...client, caretaker: newCaretakerId }
                        : client
                )
            );
        } catch (error) {
            message.error("Fout bij het bijwerken van begeleider: " + error.message);
        }
    };

    const columns = [
        {
            dataIndex: "client_info",
            key: "client_info",
            render: (clientInfo, record) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                        src={clientInfo.profile_picture}
                        alt="Profielfoto"
                        size={64}
                        style={{ marginRight: 10 }}
                    />
                    <p style={{ fontWeight: "bold"}}>{clientInfo.name}</p>
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
                    style={{ width: "90%", maxWidth: '400px' }}
                    className="prevent-row-click" // Prevent row click
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
                        style={{ width: "100%", maxWidth: "400px" }}
                        className="prevent-row-click" // Prevent row click
                    />
                    <Button
                        type="default"
                        onClick={() => handleDelete(record.id)}
                        className="prevent-row-click" // Prevent row click
                        style={{
                            fontSize: "1rem",
                            width: "100%",
                            maxWidth: "400px"
                        }}
                    >
                        Account Deactiveren <DeleteOutlined />
                    </Button>
                </div>
            ),
        },
    ];

    const dataSource = localClients.map((clientArray) => ({
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

                <h2 style={{ marginTop: '100px' }}>Clienten overzicht: </h2>

                {fetchClientsError && <p>Fout: {fetchClientsError}</p>}
                {clients.length > 0 ? (
                    <Table
                        dataSource={dataSource}
                        columns={columns}
                        showHeader={false}
                        rowKey="id"
                        pagination={{ pageSize: pageSize }}
                        style={{
                            marginTop: "20px",
                        }}
                        onRow={(record) => ({
                            onClick: (event) => {
                                // Prevent clicks on select and buttons from triggering row click
                                if (!event.target.closest(".prevent-row-click")) {
                                    handleClientClick(record);
                                }
                            },
                        })}
                        rowClassName="clickable-row"
                    />

                ) : (
                    <p>Cliënten laden...</p>
                )}

                {/* Render the modal */}
                {selectedClient && (
                    <ClientDetailsModal
                        visible={isModalVisible}
                        onClose={handleModalClose}
                        clientData={selectedClient}
                    />
                )}

                <div style={{
                    display: "flex",
                    justifyContent: "center",
                }}>
                    <Button
                        type="primary"
                        style={{ marginTop: "20px" }}
                    >
                        Genereer nieuwe profiel code
                    </Button>
                </div>


                <div
                    style={{
                        position: 'absolute',
                        top: '2%',
                        left: '2%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        cursor: 'pointer',
                        padding: '10px',
                    }}
                    onClick={() => navigate('/caretakerProfileEdit')}
                >
                    <Avatar
                        size={60}
                        src={profileData.profile_picture}
                        style={{
                            backgroundColor: themeColors.primary4,
                            color: themeColors.primary10,
                        }}
                    >
                        {profileData.name}
                    </Avatar>
                    <p style={{fontSize: '2rem'}}>
                        {profileData.name}
                    </p>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default ClientOverview;
