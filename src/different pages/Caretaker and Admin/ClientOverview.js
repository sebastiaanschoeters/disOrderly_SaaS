import React, { useEffect, useState } from "react";
import {
    Avatar,
    ConfigProvider,
    Select,
    Table,
    Button,
    message,
    Menu,
    Badge,
    Dropdown,
    Tooltip,
    Radio,
    Modal
} from "antd";
import { antThemeTokens, ButterflyIcon, themes } from "../../Extra components/themes";
import { createClient } from "@supabase/supabase-js";
import {BellOutlined, DeleteOutlined, PoweroffOutlined, QuestionCircleOutlined} from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import ClientDetailsModal from "./ClientDetailsModal";
import 'antd/dist/reset.css';
import '../../CSS/AntDesignOverride.css';
import useThemeOnCSS from "../../UseHooks/useThemeOnCSS";
import useHandleRequest from "../../UseHooks/useHandleRequest";
import useFetchCaretakerData from "../../UseHooks/useFetchCaretakerData";
import useTheme from "../../UseHooks/useTheme";

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
                ])
                .sort((a, b) => a[1].localeCompare(b[1]));

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
                    .eq("organisation", organizationId)
                    .eq("usable", false)
                    .eq("type", "caretaker");

                console.log(activationData)

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
    const caretaker_id = localStorage.getItem("user_id");
    let [savedTheme, savedDarkMode] = JSON.parse(localStorage.getItem('theme'));
    const {themeColors, setThemeName, setDarkModeFlag} = useTheme(savedTheme, savedDarkMode)

    const name = localStorage.getItem('name')
    const savedProfilePicture = localStorage.getItem('profile_picture')

    const { clients, error: fetchClientsError } = useFetchClients(caretaker_id);
    const { profileData } = useFetchCaretakerData(caretaker_id, {fetchOrganization: true});
    const { caretakers } = useFetchCaretakers(profileData.organizationId);

    useThemeOnCSS(themeColors);

    const [localClients, setLocalClients] = useState(clients);
    const [pageSize, setPageSize] = useState(10);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [pendingRequests, setPendingRequests] = useState({});

    const [isNewClientVisible, setIsNewClientVisible] = useState(false);
    const [generatedCode, setGeneratedCode] = useState(undefined);
    const [currentAmountUsers, setCurrentAmountUsers] = useState();
    const [maximumAmountUsers, setMaximumAmountUsers] = useState();
    const [messageApi, contextHolder] = message.useMessage();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);


    const [isWideEnough, setIsWideEnough] = useState(window.innerWidth >= 800);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                // Fetch notifications
                const { data: notificationData, error: notificationError } = await supabase
                    .from('Notifications')
                    .select('*') // Fetch notifications
                    .eq('recipient_id', caretaker_id || null);

                if (notificationError) throw notificationError;

                // If there are notifications, fetch the related caretaker data
                if (notificationData.length > 0) {
                    // Loop over the notifications to get the caretaker's name
                    const updatedNotifications = await Promise.all(notificationData.map(async (notification) => {
                        // Fetch the caretaker data based on the request_id in the notification
                        const { data: clientData, error: clientError } = await supabase
                            .from('User')
                            .select('name, access_level')
                            .eq('id', notification.requester_id)
                            .single(); // Only one result

                        if (clientError) throw clientError;

                        // Add the caretaker name to the notification object
                        return {
                            ...notification,
                            requesterName: clientData?.name || 'Onbekend',
                            currentAccessLevel: clientData?.access_level// Default to 'Unknown Caretaker' if not found
                        };
                    }));
                    console.log(updatedNotifications)
                    // Set the notifications state with updated data
                    setNotifications(updatedNotifications);
                }

                // Set unread count based on notifications
                setUnreadCount(notificationData.filter((n) => !n.read).length);

            } catch (error) {
                console.error("Error fetching notifications:", error.message);
            }
        };

        fetchNotifications();
    }, [profileData]); // Re-run when profileData changes


    useEffect(() => {
        setLocalClients(clients);
    }, [clients]);

    useEffect(() => {
        const calculatePageSize = () => {
            const screenHeight = window.innerHeight;
            const rowHeight = 130; // Approximate row height
            const headerHeight = 160; // Approximate header and padding
            const footerHeight = 100; // Approximate footer height
            const availableHeight = screenHeight - headerHeight - footerHeight;

            return Math.max(1, Math.floor(availableHeight / rowHeight));
        };

        setPageSize(calculatePageSize());

        const handleResize = () => {
            setPageSize(calculatePageSize());
            setIsWideEnough(window.innerWidth >= 800);
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const fetchAmountUsers = async () => {
        try {
            const {data, error} = await supabase
                .from('Activation')
                .select('*', {count : 'exact'})
                .eq('organisation', profileData.organizationId)
                .eq('type', 'user')
                .eq('usable', 'false');

            setCurrentAmountUsers(data.length);
        }
        catch (error) {
            console.error(error);
        }

        try {
            const {data, error} = await supabase
                .from('Organisations')
                .select("maximum_activations_codes")
                .eq('id', profileData.organizationId)

            if(data[0].maximum_activations_codes === 1) {
                setMaximumAmountUsers(50)
            }
            if(data[0].maximum_activations_codes === 2) {
                setMaximumAmountUsers(200)
            }
            if(data[0].maximum_activations_codes === 3) {
                setMaximumAmountUsers(1000)
            }
        }
        catch (error) {
            console.error(error);
        }

    }

    useEffect(() => {
        const initializeData = async () => {
            if (profileData?.id) {
                await fetchPendingRequests(profileData.id);
                await fetchAmountUsers()
            }
        };

        initializeData();
    }, [profileData]);

    const tooltips = {
        "Volledige toegang": "Begeleiding heeft volledige toegang en kan alles mee volgen en profiel aanpassen",
        "Gesprekken": "Begeleiding kan enkel gesprekken lezen",
        "Contacten": "Begeleiding kan zien met wie jij contact hebt",
        "Publiek profiel": "Begeleiding kan zien wat jij op je profiel plaatst, net zoals andere gebruikers",
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const notificationMenu = (
        <Menu
            style={{
                minWidth: "50vw",
                maxWidth: "400px",
                overflowWrap: "break-word",
            }}
        >
            {notifications.length > 0 ? (
                <>
                    {notifications.map((notification, index) => {
                        const requesterName = notification.requesterName || "Onbekend";
                        const previousAccessLevel = notification.currentAccessLevel;
                        const requestedAccessLevel = notification.details?.requested_access_level || "Onbekend toegangsniveau";

                        return (
                            <Menu.Item key={index}>
                                <div>
                                    <p>
                                        {requesterName} heeft een wijziging in toegangsniveau aangevraagd:
                                        <Tooltip
                                            title={tooltips[requestedAccessLevel] || "Geen informatie beschikbaar"}
                                        >
                                        <span style={{ textDecoration: "underline", cursor: "pointer", marginLeft: "5px" }}>
                                            {requestedAccessLevel}
                                        </span>
                                        </Tooltip>.
                                        Het vorige toegangsniveau was
                                        <Tooltip
                                            title={tooltips[previousAccessLevel] || "Geen informatie beschikbaar"}
                                        >
                                        <span style={{ textDecoration: "underline", cursor: "pointer", marginLeft: "5px" }}>
                                            {previousAccessLevel}
                                        </span>
                                        </Tooltip>.
                                    </p>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                                        <Button
                                            onClick={() => handleAcceptRequest(notification)}
                                            type="default"
                                            size="small"
                                        >
                                            Accepteren
                                        </Button>
                                        <Button
                                            onClick={() => handleDenyRequest(notification)}
                                            type="default"
                                            size="small"
                                        >
                                            Weigeren
                                        </Button>
                                    </div>
                                </div>
                            </Menu.Item>
                        );
                    })}
                    <Menu.Divider />
                </>
            ) : (
                <Menu.Item>Geen nieuwe meldingen</Menu.Item>
            )}
        </Menu>
    );

    const { handleRequest } = useHandleRequest(
        (notification, action) => {
            setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
            setUnreadCount((prev) => prev - 1);
        }
    )

    const handleAcceptRequest = (notification) => handleRequest(notification, 'accept', true);
    const handleDenyRequest = (notification) => handleRequest(notification, 'deny',true);

    const handleClientClick = (client) => {
        setSelectedClient(client);
        console.log(client)
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setSelectedClient(null);
        setIsModalVisible(false);
    };

    const handleAccessLevelChange = async (caretakerId, clientId, newAccessLevel) => {
        try {
            setPendingRequests((prev) => ({ ...prev, [clientId]: newAccessLevel })); // Mark as pending

            const { error } = await supabase
                .from('Notifications')
                .insert([
                    {
                        requester_id: caretakerId,
                        recipient_id: clientId,
                        type: 'ACCESS_LEVEL_CHANGE',
                        details: { requested_access_level: newAccessLevel },
                    },
                ]);

            if (error) throw error;

            message.success("Toegangsniveau wijziging verzoek verzonden!");
        } catch (error) {
            message.error("Fout bij het verzenden van toegangsniveau wijziging verzoek: " + error.message);
            setPendingRequests((prev) => {
                const updated = { ...prev };
                delete updated[clientId]; // Remove pending status on error
                return updated;
            });
        }
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

    const fetchPendingRequests = async (caretakerId) => {
        try {
            const { data, error } = await supabase
                .from('Notifications')
                .select('recipient_id, details')
                .eq('requester_id', caretakerId)
                .eq('type', 'ACCESS_LEVEL_CHANGE');

            if (error) throw error;

            // Map the data to a format usable by the state
            const pending = data.reduce((acc, request) => {
                acc[request.recipient_id] = request.details.requested_access_level;
                return acc;
            }, {});

            setPendingRequests(pending); // Update the pending requests state
        } catch (error) {
            console.error('Error fetching pending requests:', error.message);
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
            render: (accessLevel, record) => {
                return (
                    <div>
                        <Select
                            defaultValue={accessLevel}
                            onChange={(value) => handleAccessLevelChange(profileData.id, record.id, value)}
                            style={{ width: "90%", maxWidth: "400px" }}
                            className="prevent-row-click"
                            options={[
                                { value: "Volledige toegang", label: "Volledige toegang" },
                                { value: "Gesprekken", label: "Gesprekken" },
                                { value: "Contacten", label: "Contacten" },
                                { value: "Publiek profiel", label: "Publiek profiel" },
                            ]}
                        />
                        <Tooltip title={tooltips[accessLevel] || "Geen informatie beschikbaar"}>
                            <QuestionCircleOutlined
                                className="prevent-row-click"
                                style={{
                                    marginLeft: "3px",
                                    fontSize: "1.2rem",
                                    color: themeColors.primary8,
                                    cursor: "pointer",
                                }}
                            />
                        </Tooltip>
                        {pendingRequests[record.id] && (
                            <p style={{ color: themeColors.primary9, marginTop: "5px" }}>
                                Wijziging in behandeling: {pendingRequests[record.id]}
                            </p>
                        )}
                    </div>
                );
            },
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

    const handleOpenNewClient = () => {
        setIsNewClientVisible(true);
    }

    const handleCloseNewClient = () => {
        setIsNewClientVisible(false);
    }

    const handleGenerateCode = async () => {
        if(currentAmountUsers >= maximumAmountUsers) {
            handleMessage('Je hebt het maximum aantal gebruikers reeds bereikt. Neem contact op met de administrator om je plan te upgraden.')
        }
        const {data, error} = await supabase
            .from('Activation')
            .insert({'usable': true, 'type': 'user', 'organisation': profileData.organizationId})
            .select()
        console.log('Generated Code: ',data[0].code)
        setGeneratedCode(data[0].code)
        await fetchAmountUsers();
    }

    const handleMessage = (content) => {
        messageApi.open({content: content})
    }

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                textAlign: "center",
            }}
        >
            {contextHolder}
            {isWideEnough ? (
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

                        {/* Notification Button */}
                        <div
                            style={{
                                position: "absolute",
                                top: "2%",
                                right: "2%",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <Dropdown overlay={notificationMenu} trigger={["click"]}>
                                <Badge count={unreadCount} size="large">
                                    <BellOutlined
                                        style={{
                                            fontSize: "1.8rem",
                                            cursor: "pointer",
                                            color: themeColors.primary10,
                                        }}
                                    />
                                </Badge>
                            </Dropdown>
                        </div>

                        <h2 style={{ marginTop: "100px" }}>Clienten overzicht: </h2>

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

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                            }}
                        >
                            <Button
                                type="primary"
                                style={{ marginTop: "20px" }}
                                onClick={handleOpenNewClient}
                            >
                                Genereer nieuwe profiel code
                            </Button>
                        </div>

                        <div
                            style={{
                                position: "absolute",
                                top: "2%",
                                left: "2%",
                                display: "flex",
                                alignItems: "center",
                                gap: "15px",
                                cursor: "pointer",
                                padding: "10px",
                            }}
                            onClick={() => navigate("/caretakerProfileEdit")}
                        >
                            <Avatar
                                size={60}
                                src={savedProfilePicture}
                                style={{
                                    backgroundColor: themeColors.primary4,
                                    color: themeColors.primary10,
                                }}
                            >
                                {name[0]}
                            </Avatar>
                            <p style={{ fontSize: "2rem" }}>
                                {name}
                            </p>
                        </div>
                        <Button
                            type="secondary"
                            icon={<PoweroffOutlined />}
                            style={{
                                fontSize: "2rem",
                                position: "absolute",
                                bottom: "5%",
                                right: "1%",
                            }}
                            onClick={() => handleLogout()}
                        >
                            Log uit
                        </Button>
                    </div>

                    <Modal
                        open={isNewClientVisible}
                        onCancel={handleCloseNewClient}
                        footer={null}
                        style={{padding: '10px'}}
                        >
                        <h3>Activatiecode voor de nieuwe gebruiker:</h3>
                        <h2>{generatedCode}</h2>

                        <h4> Er zijn reeds <b>{currentAmountUsers}</b> van de maximaal <b>{maximumAmountUsers}</b> codes in gebruik.</h4>

                        <Button
                            type={"primary"}
                            onClick={()=> handleGenerateCode()}
                        >
                            Genereer
                        </Button>
                    </Modal>
                </ConfigProvider>
            ) : (
                <div>
                    <h1>Scherm te smal</h1>
                    <p>Open deze pagina op een breder scherm (minimaal 800px).</p>
                </div>
            )}
        </div>
    );
};

export default ClientOverview;
